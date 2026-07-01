// 1. Tipo estricto para controlar los 5 colores exactos solicitados para las tarjetas
export type StatCardColorType = 'azul' | 'morado' | 'verde' | 'amarillo' | 'rojo';

// 2. Interfaz para las 8 tarjetas de métricas del "System Stats Module"
export interface StatItem {
    id: number;
    label: string;
    count: number;
    icon: string; // Nombre del icono de la librería (ej: 'Users', 'Shield')
    type: StatCardColorType;
}

// 3. Interfaz para el modelo de usuario utilizado en la tabla y los módulos de actualizar/eliminar
export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user'; // Criterio de aceptación: Solo deben aparecer estos 2 estados
    created: string;
    lastAccess: string;
    avatar: string; // Inicial para el círculo del diseño (ej: 'A', 'U', 'R')
}