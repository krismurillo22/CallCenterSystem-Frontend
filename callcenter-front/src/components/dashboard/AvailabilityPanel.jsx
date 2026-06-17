import { RANK_LABELS } from "../../data/mockData";

const BAR_COLORS = { 1: "bg-slate-400", 2: "bg-indigo-500", 3: "bg-amber-400" };
const TEXT_COLORS = { 1: "text-slate-600", 2: "text-indigo-600", 3: "text-amber-600" };

/**
 * Barras de disponibilidad por rango (Operador / Supervisor / Gerente).
 * @param {{ employees: import("../../data/mockData").Employee[] }} props
 */
export function AvailabilityPanel({ employees }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-sm text-foreground mb-4">Disponibilidad por rango</h3>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((rank) => {
          const group = employees.filter((e) => e.rank === rank);
          const avail = group.filter((e) => e.is_available).length;
          const pct = group.length > 0 ? (avail / group.length) * 100 : 0;
          return (
            <div key={rank}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-foreground">{RANK_LABELS[rank]}</span>
                <span className={`text-xs font-medium ${TEXT_COLORS[rank]}`}>
                  {avail}/{group.length}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[rank]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AvailabilityPanel;
