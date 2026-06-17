import { ArrowUpRight } from "lucide-react";
import { RankBadge } from "../common/StatusBadge";

// Por ahora el log de escalamientos es mock fijo (no viene de mockData.js
// porque todavía no existe un endpoint/eventos reales para esto). Cuando el
// backend exponga un historial de escalamientos, esto debería venir de
// services/callsService.js (p. ej. getEscalationLog()) en vez de estar
// hardcodeado aquí.
const mockEscalations = [
  { id: "ev1", callId: 106, callerName: "Isabel Flores",  fromRank: 2, toRank: 3, timestamp: "2026-06-17T10:00:00" },
  { id: "ev2", callId: 106, callerName: "Isabel Flores",  fromRank: 1, toRank: 2, timestamp: "2026-06-17T09:45:00" },
  { id: "ev3", callId: 104, callerName: "Rosa Hernández", fromRank: 1, toRank: 2, timestamp: "2026-06-17T09:50:00" },
  { id: "ev4", callId: 102, callerName: "María González", fromRank: 1, toRank: 2, timestamp: "2026-06-17T10:05:00" },
  { id: "ev5", callId: 111, callerName: "Oscar Mendez",   fromRank: 1, toRank: 2, timestamp: "2026-06-17T08:50:00" },
];

/**
 * @param {{ liveEscalations?: typeof mockEscalations }} props
 */
export function EscalationLog({ liveEscalations = [] }) {
  const all = [...liveEscalations, ...mockEscalations].slice(0, 8);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <ArrowUpRight size={15} className="text-muted-foreground" />
        <span className="font-semibold text-sm text-foreground">Escalamientos recientes</span>
      </div>
      <div className="divide-y divide-border">
        {all.map((ev) => (
          <div key={ev.id} className="px-5 py-3 flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-mono)" }}>
              {new Date(ev.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-sm text-foreground flex-1 truncate">{ev.callerName}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <RankBadge rank={ev.fromRank} />
              <ArrowUpRight size={12} className="text-red-400" />
              <RankBadge rank={ev.toRank} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EscalationLog;
