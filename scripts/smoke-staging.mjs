const targets = {
  api: process.env.GOODZ_API_URL ?? "http://localhost:4000",
  web: process.env.GOODZ_WEB_URL ?? "http://localhost:3000",
  admin: process.env.GOODZ_ADMIN_URL ?? "http://localhost:5173",
  process: process.env.GOODZ_PROCESS_URL ?? "http://localhost:5180",
};

async function checkJson(label, url, validate) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${label} ${url} returned ${res.status}`);
  }

  const data = await res.json();
  validate(data);
  console.log(`ok ${label} ${url}`);
}

async function checkPage(label, url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${label} ${url} returned ${res.status}`);
  }

  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`${label} ${url} returned an empty body`);
  }

  console.log(`ok ${label} ${url}`);
}

async function main() {
  await checkJson("api health", `${targets.api}/health`, (data) => {
    if (data?.ok !== true) throw new Error("api health is not ok");
  });

  await checkJson("api products", `${targets.api}/api/products`, (data) => {
    if (!Array.isArray(data?.products) || data.products.length === 0) {
      throw new Error("api products has no items");
    }
  });

  await checkJson("process status", `${targets.api}/api/process/status`, (data) => {
    if (!Array.isArray(data?.phases) || data.phases.length === 0) {
      throw new Error("process status has no phases");
    }
    if (!Array.isArray(data?.deliverables) || data.deliverables.length === 0) {
      throw new Error("process status has no deliverables");
    }
    if (
      !Array.isArray(data?.planningChanges) ||
      data.planningChanges.length === 0
    ) {
      throw new Error("process status has no planning changes");
    }
    if (!Array.isArray(data?.approvals) || data.approvals.length === 0) {
      throw new Error("process status has no approvals");
    }
    if (!Array.isArray(data?.traceLinks) || data.traceLinks.length === 0) {
      throw new Error("process status has no trace links");
    }
  });

  await checkPage("web shop", targets.web);
  await checkPage("admin dashboard", targets.admin);
  await checkPage("process dashboard", targets.process);

  console.log("Goodz staging smoke passed");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
