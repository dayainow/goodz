import { listManagedServices } from "./catalog.js";

const catalog = listManagedServices();

if (catalog.total < 2 || catalog.services.length !== catalog.total) {
  throw new Error("Internal service catalog fixture is invalid");
}

if (catalog.services.some((service) => !service.owner || !service.runbookUrl)) {
  throw new Error("Every internal service needs an owner and runbook");
}

console.log("internal service reference ok");
