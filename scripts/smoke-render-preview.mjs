const baseUrl = (
  process.env.GOODZ_RENDER_PREVIEW_URL ??
  "https://goodz-process-os-preview.onrender.com"
).replace(/\/$/, "");

async function request(path) {
  return fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(90_000),
  });
}

async function checkHealth() {
  const response = await request("/health");
  if (!response.ok) {
    throw new Error(`/health returned ${response.status}`);
  }

  const data = await response.json();
  if (data?.ok !== true || data?.service !== "goodz-api") {
    throw new Error("/health returned an invalid service response");
  }

  console.log("ok /health (200)");
}

async function checkProtected(path) {
  const response = await request(path);
  const challenge = response.headers.get("www-authenticate") ?? "";

  if (response.status !== 401) {
    throw new Error(`${path} returned ${response.status}; expected 401`);
  }
  if (!challenge.toLowerCase().startsWith("basic ")) {
    throw new Error(`${path} did not return a Basic authentication challenge`);
  }

  console.log(`ok ${path} (401 Basic)`);
}

async function main() {
  await checkHealth();
  await checkProtected("/");
  await checkProtected("/api/process/operations");
  console.log(`Goodz Render preview smoke passed: ${baseUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
