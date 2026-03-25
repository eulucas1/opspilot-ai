export interface NavigationItem {
  label: string;
  href: string;
  description: string;
}

export interface HealthStatus {
  status: "ok" | "degraded";
  service: string;
  environment: string;
}
