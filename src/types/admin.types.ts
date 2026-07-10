// Color palette for the 6 StatCards rendered inside the admin panel.
export type StatCardColorType = 'azul' | 'morado' | 'verde' | 'amarillo' | 'rojo';

// Shape rendered by StatCard; StatsModule builds these from GET /admin/stats.
export interface StatItem {
    id: number;
    label: string;
    count: number;
    icon: string; // lucide-react icon name (e.g. 'Users', 'Shield')
    type: StatCardColorType;
}
