import { RANK_LABELS } from "../../data/mockData";

// ─────────────────────────────────────────────────────────────────────────
// Badges compartidos entre TODAS las páginas (Dashboard, Cola, Agentes,
// Historial). Si tu página necesita mostrar el estado de una llamada o el
// rango de un agente, importa esto en vez de inventar tu propio badge:
//
//   import { StatusBadge, RankBadge } from "../common/StatusBadge";
// ─────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:    { label: "Activa",     bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  queue:     { label: "En cola",    bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  escalated: { label: "Escalada",   bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500" },
  finished:  { label: "Finalizada", bg: "bg-gray-100",   text: "text-gray-500",    dot: "bg-gray-400" },
};

export function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === "active" ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
}

const RANK_CONFIG = {
  1: { bg: "bg-slate-100", text: "text-slate-600" },
  2: { bg: "bg-indigo-50", text: "text-indigo-600" },
  3: { bg: "bg-amber-50",  text: "text-amber-700" },
};

export function RankBadge({ rank }) {
  const c = RANK_CONFIG[rank];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {RANK_LABELS[rank]}
    </span>
  );
}

export function AvailabilityDot({ available }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${available ? "bg-emerald-400" : "bg-gray-200"}`} />
  );
}
