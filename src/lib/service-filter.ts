import type { Service } from "./types";

export interface ServiceFilter {
  category?: string | null;
  query?: string | null;
}

export function filterServices(
  services: Service[],
  { category, query }: ServiceFilter,
): Service[] {
  const needle = (query ?? "").trim().toLowerCase();

  return services.filter((service) => {
    const matchesCategory = !category || service.category === category;
    const matchesQuery =
      !needle ||
      [service.name, service.description ?? "", service.category].some((value) =>
        value.toLowerCase().includes(needle),
      );
    return matchesCategory && matchesQuery;
  });
}
