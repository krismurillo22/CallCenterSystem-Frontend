import { KpiCards } from "../dashboard/KpiCards";
import { ActiveCallsTable } from "../dashboard/ActiveCallsTable";
import { AvailabilityPanel } from "../dashboard/AvailabilityPanel";
import { EscalationLog } from "../dashboard/EscalationLog";
import { CallQueuePanel } from "../calls/CallQueuePanel";

// ─────────────────────────────────────────────────────────────────────────
// Página de Dashboard ("Vista general"). Es puramente de presentación: no
// guarda estado propio ni habla con los services directamente — recibe
// todo por props desde App.jsx, que es quien centraliza el estado
// compartido (calls/employees/queue) entre todas las páginas.
//
// Esto es a propósito: así esta página queda 100% terminada y no le importa
// si "Cola", "Agentes" o "Historial" ya existen o no. El día que un
// compañero termine su página, solo agrega el bloque correspondiente en
// App.jsx (ver los comentarios "TODO" ahí) y todo encaja sin tocar nada de
// este archivo.
// ─────────────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   calls: import("../../data/mockData").Call[],
 *   employees: import("../../data/mockData").Employee[],
 *   queue: import("../../data/mockData").QueueEntry[],
 *   onEscalate: (callId: number) => void,
 *   onFinish: (callId: number) => void,
 *   onAssign: (callId: number) => void,
 *   onDispatch: (callId: number) => void,
 * }} props
 */
export default function DashboardPage({ calls, employees, queue, onEscalate, onFinish, onAssign, onDispatch }) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <KpiCards calls={calls} employees={employees} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <ActiveCallsTable
            calls={calls}
            employees={employees}
            onEscalate={onEscalate}
            onFinish={onFinish}
            onAssign={onAssign}
          />
          <CallQueuePanel queue={queue} calls={calls} employees={employees} onDispatch={onDispatch} />
        </div>

        <div className="flex flex-col gap-6">
          <AvailabilityPanel employees={employees} />
          <EscalationLog />
        </div>
      </div>
    </div>
  );
}
