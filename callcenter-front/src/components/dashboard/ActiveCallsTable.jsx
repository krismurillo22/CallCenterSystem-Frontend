import { useState, useEffect } from "react";
import { ArrowUpCircle, PhoneOff, Phone, UserPlus } from "lucide-react";
import { StatusBadge, RankBadge } from "../common/StatusBadge";
import { getElapsed } from "../../data/mockData";

function ElapsedTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(getElapsed(startedAt));
  useEffect(() => {
    const t = setInterval(() => setElapsed(getElapsed(startedAt)), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  return (
    <span className="text-xs tabular-nums text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
      {elapsed}
    </span>
  );
}

/**
 * Tabla de llamadas activas/escaladas. Espera recibir `calls` y `employees`
 * completos (no filtrados) y filtra internamente.
 *
 * @param {{
 *   calls: import("../../data/mockData").Call[],
 *   employees: import("../../data/mockData").Employee[],
 *   onEscalate: (callId: number) => void,
 *   onFinish: (callId: number) => void,
 *   onAssign: (callId: number) => void,
 * }} props
 */
export function ActiveCallsTable({ calls, employees, onEscalate, onFinish, onAssign }) {
  const activeCalls = calls.filter((c) => c.status === "active" || c.status === "escalated");
  const getEmployee = (id) => employees.find((e) => e.id === id);
  const hasAvailableAgent = (rankNeeded) => employees.some((e) => e.is_available && e.rank >= rankNeeded);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Phone size={15} className="text-muted-foreground" />
          <span className="font-semibold text-sm text-foreground">Llamadas en curso</span>
        </div>
        <span className="text-xs text-muted-foreground">{activeCalls.length} activas</span>
      </div>

      {activeCalls.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">Sin llamadas activas</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Llamante", "Teléfono", "Rango", "Agente asignado", "Duración", "Escal.", "Estado", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeCalls.map((call) => {
                const emp = getEmployee(call.employee_id);
                const canAssign = !emp && hasAvailableAgent(call.rank_required);
                return (
                  <tr key={call.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{call.caller_name}</div>
                      <div className="text-xs text-muted-foreground">#{call.id}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap" style={{ fontFamily: "var(--font-mono)" }}>
                      {call.caller_phone}
                    </td>
                    <td className="px-5 py-3.5">
                      <RankBadge rank={call.rank_required} />
                    </td>
                    <td className="px-5 py-3.5">
                      {emp ? (
                        <span className="text-sm text-foreground">{emp.name}</span>
                      ) : canAssign ? (
                        <button
                          onClick={() => onAssign(call.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <UserPlus size={12} />
                          Asignar agente
                        </button>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Sin agentes disponibles</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <ElapsedTimer startedAt={call.started_at} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {call.escalations > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-500 text-xs font-medium">
                          {call.escalations}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={call.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        {call.rank_required < 3 && (
                          <button
                            onClick={() => onEscalate(call.id)}
                            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 px-2.5 py-1 rounded-lg hover:bg-amber-50 transition-colors font-medium whitespace-nowrap"
                          >
                            <ArrowUpCircle size={13} />
                            Escalar
                          </button>
                        )}
                        <button
                          onClick={() => onFinish(call.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors font-medium whitespace-nowrap"
                        >
                          <PhoneOff size={13} />
                          Finalizar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ActiveCallsTable;
