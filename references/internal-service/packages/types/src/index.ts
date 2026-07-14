export type ServiceTier = "critical" | "standard" | "supporting";

export type ServiceLifecycle = "active" | "maintenance" | "retired";

export interface ManagedService {
  id: string;
  name: string;
  owner: string;
  tier: ServiceTier;
  lifecycle: ServiceLifecycle;
  repositoryUrl: string;
  runbookUrl: string;
}

export interface ServiceCatalogResponse {
  services: ManagedService[];
  total: number;
  generatedAt: string;
}
