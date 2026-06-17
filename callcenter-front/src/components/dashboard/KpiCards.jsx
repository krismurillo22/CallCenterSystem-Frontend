import { PhoneCall, Clock, ArrowUpCircle, CheckCircle2, UserCheck, UserX } from "lucide-react";

/**
 * @param {{ calls: import("../../data/mockData").Call[], employees: import("../../data/mockData").Employee[] }} props
 */
export function KpiCards({ calls, employees }) {
  const active    = calls.filter((c) => c.status === "active").length;
  const queued    = calls.filter((c) => c.status === "queue").length;
  const escalated = calls.filter((c) => c.status === "escalated").length;
  const finished  = calls.filter((c) => c.status === "finished").length;
  const available = employees.filter((e) => e.is_available).length;
  const busy      = employees.filter((e) => !e.is_available).length;

  const cards = [
    { label: "Llamadas activas",    value: active,    icon: PhoneCall,     color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "En cola",             value: queued,    icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
    { label: "Escaladas",           value: escalated, icon: ArrowUpCircle, color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100" },
    { label: "Finalizadas hoy",     value: finished,  icon: CheckCircle2,  color: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-100" },
    { label: "Agentes disponibles", value: available, icon: UserCheck,     color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-100" },
    { label: "Agentes ocupados",    value: busy,       icon: UserX,        color: "text-violet-500",  bg: "bg-violet-50",  border: "border-violet-100" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`bg-card rounded-xl border ${card.border} p-4 flex flex-col gap-3`}>
          <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
            <card.icon size={16} className={card.color} />
          </div>
          <div>
            <div className={`text-2xl font-semibold tabular-nums ${card.color}`} style={{ fontFamily: "var(--font-mono)" }}>
              {String(card.value).padStart(2, "0")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default KpiCards;
