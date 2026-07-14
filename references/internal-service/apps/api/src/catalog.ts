import type {
  ManagedService,
  ServiceCatalogResponse,
} from "@goodz/internal-service-types";

const services: ManagedService[] = [
  {
    id: "identity-api",
    name: "Identity API",
    owner: "platform-team",
    tier: "critical",
    lifecycle: "active",
    repositoryUrl: "https://example.com/internal/identity-api",
    runbookUrl: "https://example.com/runbooks/identity-api",
  },
  {
    id: "notification-worker",
    name: "Notification Worker",
    owner: "engagement-team",
    tier: "standard",
    lifecycle: "maintenance",
    repositoryUrl: "https://example.com/internal/notification-worker",
    runbookUrl: "https://example.com/runbooks/notification-worker",
  },
];

export function listManagedServices(): ServiceCatalogResponse {
  return {
    services,
    total: services.length,
    generatedAt: new Date().toISOString(),
  };
}

export function findManagedService(id: string): ManagedService | undefined {
  return services.find((service) => service.id === id);
}
