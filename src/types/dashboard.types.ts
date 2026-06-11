import { ReactNode } from "react";

export interface DashboardMetric {
  id: string;
  count: number;
  title: string;
  subtext: string;
  icon: ReactNode; // Aceptamos componentes (Iconos de Lucide)
}

export interface VacancyStatus {
  id: string;
  label: string;
  percentage: number;
  count: number;
  colorHex: string;
  bgClass: string;
}

export interface MonthlyData {
  month: string;
  posiciones: number;
  cvs: number;
  vacantes: number;
}

export interface DashboardStats {
  metrics: DashboardMetric[];
  vacancyStatuses: VacancyStatus[];
  monthlyData: MonthlyData[];
}