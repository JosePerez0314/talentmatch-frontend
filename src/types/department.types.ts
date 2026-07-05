export interface Department {
    id: string;
    name: string;
    positionsCount: number;
    createdAt?: string; // Agregado para cumplir con el diseño de Figma e histórico
}

// Tipos auxiliares para peticiones limpias
export interface CreateDepartmentInput {
    name: string;
}

export interface UpdateDepartmentInput {
    name: string;
}