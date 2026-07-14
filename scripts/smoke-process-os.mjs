const baseUrl = (process.env.GOODZ_PROCESS_OS_URL ?? "http://localhost:4000").replace(/\/$/, "");
const smokeUser = process.env.GOODZ_PROCESS_OS_USER;
const smokePassword = process.env.GOODZ_PROCESS_OS_PASSWORD;
const authorization =
  smokeUser && smokePassword
    ? `Basic ${Buffer.from(`${smokeUser}:${smokePassword}`).toString("base64")}`
    : undefined;

function request(path = "") {
  return fetch(`${baseUrl}${path}`, {
    headers: authorization ? { authorization } : undefined,
  });
}

async function getJson(path, validate) {
  const response = await request(path);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  const data = await response.json();
  validate(data);
  console.log(`ok ${path}`);
}

async function main() {
  await getJson("/health", (data) => {
    if (data?.ok !== true) throw new Error("health is not ok");
  });

  let referenceAvailable = false;
  await getJson("/api/process/reference", (data) => {
    if (typeof data?.available !== "boolean") throw new Error("Reference capability is invalid");
    referenceAvailable = data.available;
  });

  if (referenceAvailable) {
    await getJson("/api/process/status", (data) => {
      if (!Array.isArray(data?.phases) || data.phases.length === 0) {
        throw new Error("process status has no phases");
      }
    });
  } else {
    const status = await request("/api/process/status");
    if (status.status !== 404) throw new Error(`disabled Reference status returned ${status.status}`);
    console.log("ok /api/process/status (404, Reference disabled)");
  }

  await getJson("/api/process/operations", (data) => {
    if (data?.storage?.engine !== "sqlite") {
      throw new Error("operations storage is not sqlite");
    }
    if (!Number.isInteger(data?.storage?.schemaVersion) || data.storage.schemaVersion < 5) {
      throw new Error("operations schema is not migrated");
    }
  });

  await getJson("/api/process/workspace", (data) => {
    if (!Array.isArray(data?.templates) || data.templates.length === 0) {
      throw new Error("process workspace has no templates");
    }
    if (
      !Array.isArray(data?.projects) ||
      !Array.isArray(data?.runs) ||
      !Array.isArray(data?.briefs) ||
      !Array.isArray(data?.designPacks) ||
      !Array.isArray(data?.designJobs)
    ) {
      throw new Error("process workspace projection is invalid");
    }
  });

  const page = await request();
  const html = await page.text();
  if (!page.ok || !html.includes("Process Dashboard")) {
    throw new Error("process dashboard page is unavailable");
  }
  console.log("ok /");
  console.log("Goodz Process OS smoke passed");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
