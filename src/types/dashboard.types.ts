import { ReactNode } from "react";
import { VacancyStatus as VacancyStatusEnum } from "./api.types";

// ---- Tipos de la API (GET /api/dashboard, §7) ----

export interface DashboardTotals {
  positionsCount: number;
  departmentsCount: number;
  candidatesCount: number;
  openVacanciesCount: number;
}

export interface VacancyStatusBreakdownItem {
  status: VacancyStatusEnum;
  count: number;
  percentage: number;
}

export interface MonthlyActivityItem {
  month: string; // "YYYY-MM"
  positionsCreated: number;
  cvUploads: number;
  vacanciesCreated: number;
}

export interface DashboardSummary {
  total: DashboardTotals;
  vacancyStatusBreakdown: VacancyStatusBreakdownItem[];
  monthlyActivity: MonthlyActivityItem[];
}

// ---- Tipos de la UI (mock data + tarjetas) ----

export interface DashboardMetric {
  id: string;
  count: number;
  title: string;
  subtext: string;
  icon: ReactNode; // Aceptamos componentes (Iconos de Lucide)
}

export interface DashboardVacancyStatusCard {
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