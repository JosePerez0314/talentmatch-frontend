export interface DashboardMetric {
  id: string;
  count: number;
  title: string;
  subtext: string;
  icon: string;
}

export interface VacancyStatus {
  id: string;
  label: string;
  percentage: number;
  count: number;
  colorHex: string;
  bgClass: string;
}

export interface DashboardStats {
  metrics: DashboardMetric[];
  vacancyStatuses: VacancyStatus[];
  totalVacancies: number;
}