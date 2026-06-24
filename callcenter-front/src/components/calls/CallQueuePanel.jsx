import { useState, useEffect } from "react";
import { Clock, ArrowRight, ListOrdered, AlertCircle } from "lucide-react";
import { RankBadge } from "../common/StatusBadge";
import { getElapsed } from "../../data/mockData";

// NOTA para quien haga la página de "Cola": este componente vive fuera de
// dashboard/ a propósito porque el Dashboard y la página de Cola muestran
// exactamente el mismo panel. Solo impórtalo desde aquí, no lo dupliques.

function WaitTimer({ joinedAt }) {
  const [wait, setWait] = useState(getElapsed(joinedAt));
  useEffect(() => {
    const t = setInterval(() => setWait(getElapsed(joinedAt)), 1000);
    return () => clearInterval(t);
  }, [joinedAt]);
  return (
    <span className="tabular-nums text-amber-600 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
      {wait}
    </span>
  );
}

/**
 * @param {{
 *   queue: import("../../data/mockData").QueueEntry[],
 *   calls: import("../../data/mockData").Call[],
 *   employees: import("../../data/mockData").Employee[],
 *   onDispatch: (callId: number) => void,
 * }} props
 */
export function CallQueuePanel({ queue, calls, employees, onDispatch }) {
  const getCall = (id) => calls.find((c) => c.id === id);
  const hasAgent = (rankNeeded) =>
  employees.some(
    (e) => e.is_available && !e.active_call_id && e.rank >= rankNeeded
  );
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <ListOrdered size={15} className="text-muted-foreground" />
          <span className="font-semibold text-sm text-foreground">Cola de espera</span>
        </div>
        {queue.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {queue.length} esperando
          </span>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Cola vacía</div>
      ) : (
        <div className="divide-y divide-border">
          {queue.map((entry, i) => {
            const call = getCall(entry.call_id);
            if (!call) return null;
            const canDispatch = hasAgent(call.rank_required);
            return (
              <div key={entry.id} className="px-5 py-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
                <span className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground text-sm">{call.caller_name}</span>
                    <RankBadge rank={call.rank_required} />
                    {call.escalations > 0 && (
                      <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        {call.escalations}x escalada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                      {call.caller_phone}
                    </span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <Clock size={11} className="text-amber-400" />
                    <WaitTimer joinedAt={entry.joined_at} />
                  </div>
                </div>

                {canDispatch ? (
                  <button
                    onClick={() => onDispatch(call.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Despachar
                    <ArrowRight size={12} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <AlertCircle size={12} className="text-amber-400" />
                    Sin agente
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CallQueuePanel;
