import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Sparkles, Layers, Calendar, ChevronDown, Eye } from "lucide-react";

// TIPADOS
type CandidateStatus = "No Contratado" | "Contactado" | "Contratado";

interface MockCandidate {
    id: string;
    fullName: string;
    email: string;
    matchScore: number;
    role: string;
    status: CandidateStatus;
    rank: number;
}

//   MOCK DATA ESTÁTICO (para validación visual)
const MOCK_RESULTS: MockCandidate[] = [
    { id: "1", rank: 1, fullName: "María López", email: "maria.lopez@gmail.com", matchScore: 94, role: "UX/UI Designer", status: "No Contratado" },
    { id: "2", rank: 2, fullName: "Ana García", email: "ana.garcia@gmail.com", matchScore: 69, role: "Frontend Developer", status: "Contactado" },
    { id: "3", rank: 3, fullName: "Diego Vargas", email: "diego.vargas@gmail.com", matchScore: 63, role: "Product Manager", status: "Contratado" },
];

// COMPONENTES DE UI

// Gráfico Circular SVG Nativo 
const CircularProgress = ({ score }: { score: number }) => {
    const radius = 42;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 80) return "#00FA15"; // Verde
        if (s >= 50) return "#F8C807"; // Amarillo
        return "#EF5050";              // Rojo
    };