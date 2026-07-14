import React from "react";
import {
  Briefcase,
  Calendar,
  Code,
  Download,
  GraduationCap,
  Globe,
  Mail,
  Star,
  X,
  Zap,
} from "lucide-react";
import { MatchResult, NormalizedCandidate } from "../../types/api.types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CandidateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MatchResult | null;
}

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#00FA15";
  if (score >= 50) return "#F8C807";
  return "#EF5050";
};

const parseArray = (value: unknown): string[] => {
  if (Array.isArray(value))
    return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string" && value.trim())
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
};

// normalizedCandidate arrives from the API as a serialized JSON string
const parseNormalized = (
  raw: string | undefined,
): NormalizedCandidate | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NormalizedCandidate;
  } catch {
    return null;
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, max }) => {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const barColor = getScoreColor(pct);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 flex-shrink-0">{label}</span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "#F0F0F5" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs text-gray-600 w-12 text-right flex-shrink-0 tabular-nums">
        {current}/{max}
      </span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const candidate = data.candidate;
  const normalized = parseNormalized(data.normalizedCandidate);

  const overallScore = data.matchScore ?? 0;
  const scoreColor = getScoreColor(overallScore);

  const fullName =
    candidate?.fullName ||
    normalized?.fullName ||
    [candidate?.firstName, candidate?.lastName].filter(Boolean).join(" ") ||
    "Candidato";

  const role = normalized?.role ?? candidate?.niche ?? null;
  const yearsExp =
    normalized?.yearsOfExperience ?? normalized?.yearsExperience ?? null;

  const techSkills = parseArray(
    normalized?.technicalSkills ?? candidate?.skills,
  );
  const optSkills = parseArray(normalized?.optionalTechnicalSkills);
  const softSkills = parseArray(normalized?.softSkills);
  const languages = parseArray(normalized?.languages);

  // Education: show area first, fall back to level
  const education =
    normalized?.educationArea ?? normalized?.educationLevel ?? null;

  const breakdown = [
    { label: "Hard Skills", current: data.hardSkillsScore ?? 0, max: 30 },
    { label: "Experiencia", current: data.experienceScore ?? 0, max: 20 },
    { label: "Rol", current: data.roleScore ?? 0, max: 15 },
    { label: "Idiomas", current: data.languagesScore ?? 0, max: 15 },
    { label: "Educación", current: data.educationScore ?? 0, max: 10 },
    { label: "Soft Skills", current: data.softSkillsScore ?? 0, max: 10 },
  ];
  const hasBreakdown = breakdown.some((b) => b.current > 0);

  // AI analysis fields — summary and redFlags come from top-level MatchResult;
  // projectHighlights come from the parsed normalizedCandidate
  const summary = data.summary ?? data.matchReasoning ?? null;
  const redFlags = data.redFlags ?? null;
  const projectHighlights = normalized?.aiAnalysis?.projectHighlights ?? [];
  const hasAnalysis = Boolean(summary || projectHighlights.length > 0);

  // CV URL: fileUrl is the field returned by the results endpoint
  const cvUrl = candidate?.fileUrl ?? candidate?.resumeUrl ?? null;

  const evaluatedAt =
    (data.evaluatedAt ?? data.createdAt)
      ? new Date((data.evaluatedAt ?? data.createdAt)!).toLocaleDateString(
          "es-ES",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          },
        )
      : null;

  // Status badge
  const isContratado = candidate?.status === "CONTRATADO";
  const statusLabel = isContratado ? "Contratado" : "No Contratado";
  const statusClass = isContratado
    ? "bg-green-100 text-green-600"
    : "bg-gray-100 text-gray-500";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* ── Header bar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-[#447ECA] transition-colors flex items-center gap-1.5"
          >
            ← Volver a resultados
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Candidate header */}
          <div
            className="p-5 sm:p-6 flex items-center gap-4 flex-shrink-0"
            style={{ backgroundColor: "#F0F0F5" }}
          >
            {/* Score box */}
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: scoreColor }}
            >
              <span className="text-xl font-black leading-none text-gray-800">
                {Math.round(overallScore)}%
              </span>
              <span className="text-[9px] font-bold uppercase text-gray-700/70 mt-0.5">
                Match
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                {fullName}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs">
                <Mail size={11} className="flex-shrink-0" />
                <span className="truncate">
                  {candidate?.email ?? normalized?.email ?? "Sin correo"}
                </span>
              </div>
              {role && (
                <div className="flex items-center gap-1.5 mt-0.5 text-gray-500 text-xs">
                  <Briefcase size={11} className="flex-shrink-0" />
                  <span>
                    {role}
                    {yearsExp != null && (
                      <span className="text-gray-400">
                        {" "}
                        · {yearsExp} año{yearsExp !== 1 ? "s" : ""} exp.
                      </span>
                    )}
                  </span>
                </div>
              )}
              {evaluatedAt && (
                <div className="flex items-center gap-1.5 mt-0.5 text-gray-400 text-[10px]">
                  <Calendar size={10} className="flex-shrink-0" />
                  <span>Evaluado el: {evaluatedAt}</span>
                </div>
              )}
            </div>

            {/* Status badge */}
            {candidate?.status && (
              <span
                className={`self-start mt-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusClass}`}
              >
                {statusLabel}
              </span>
            )}
          </div>

          {/* Content sections */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* Score breakdown */}
            {hasBreakdown && (
              <section>
                <h3 className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                  <Star size={14} className="text-[#447ECA]" />
                  Desglose del score
                </h3>
                <div className="space-y-2.5">
                  {breakdown.map((item) => (
                    <ProgressBar
                      key={item.label}
                      label={item.label}
                      current={item.current}
                      max={item.max}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Technical skills */}
            <section>
              <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <Code size={14} className="text-[#447ECA]" />
                Habilidades técnicas
              </h3>
              {techSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {techSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm text-gray-700"
                      style={{ backgroundColor: "#96FFC1" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No especificadas</p>
              )}
            </section>

            {/* Optional technical skills */}
            {optSkills.length > 0 && (
              <section>
                <h3 className="text-sm text-gray-500 mb-2">
                  Habilidades técnicas opcionales
                </h3>
                <div className="flex flex-wrap gap-2">
                  {optSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm text-gray-600 bg-gray-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Soft skills */}
            {softSkills.length > 0 && (
              <section>
                <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <Zap size={14} className="text-[#447ECA]" />
                  Habilidades blandas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm text-gray-600"
                      style={{ backgroundColor: "#DCF9FF" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Education + Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <section>
                <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <GraduationCap size={14} className="text-[#447ECA]" />
                  Educación
                </h3>
                {education ? (
                  <p className="text-sm text-gray-700">{education}</p>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No especificada
                  </p>
                )}
              </section>

              <section>
                <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <Globe size={14} className="text-[#447ECA]" />
                  Idiomas
                </h3>
                {languages.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((l, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs text-gray-600 bg-gray-100"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No especificados
                  </p>
                )}
              </section>
            </div>

            {/* AI Analysis */}
            {hasAnalysis && (
              <section
                className="rounded-xl p-4 sm:p-5 space-y-3"
                style={{ backgroundColor: "#F0F0F5" }}
              >
                <h3 className="text-sm text-gray-500">Análisis de IA</h3>

                {summary && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Resumen</p>
                    <p className="text-sm text-gray-700">{summary}</p>
                  </div>
                )}

                {redFlags && redFlags !== "Ninguno" && (
                  <div>
                    <p className="text-xs text-red-400 mb-1">Red Flags</p>
                    <p className="text-sm text-red-500">{redFlags}</p>
                  </div>
                )}

                {projectHighlights.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Proyectos destacados
                    </p>
                    <ul className="space-y-1">
                      {projectHighlights.map((proj, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-[#447ECA] mt-0.5 flex-shrink-0">
                            •
                          </span>
                          {proj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#447ECA] text-white rounded-lg text-sm font-medium hover:bg-[#3669ab] transition-colors"
            >
              <Download size={14} />
              Descargar CV
            </a>
          ) : (
            <span />
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;
