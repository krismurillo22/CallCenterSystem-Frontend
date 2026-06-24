import { useState, useEffect } from "react";
import { LayoutDashboard, Clock, Users, History } from "lucide-react";

import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import Modal from "./components/ui/Modal";
import DashboardPage from "./components/pages/DashboardPage";

// ─────────────────────────────────────────────────────────────────────────
// Páginas de los compañeros de equipo — PIEZAS DEL ROMPECABEZAS
// ─────────────────────────────────────────────────────────────────────────
// Cada quien descomenta su import aquí cuando termine su página:
import QueuePage from "./components/pages/QueuePage";
import EmployeesPage from "./components/pages/EmployeesPage";
import HistoryPage from "./components/pages/HistoryPage";
//
// Y luego busca los comentarios "TODO" más abajo en el <main> para
// descomentar el bloque correspondiente. No hay que tocar nada más.

// ── Modales globales (no implementados todavía) ─────────────────────────
import NewCallModal from "./components/calls/NewCallModal";
import NewEmployeeModal from "./components/employees/NewEmployeeModal";
import EditEmployeeModal from "./components/employees/EditEmployeeModal";

import * as callsService from "./services/callsService";
import * as employeesService from "./services/employeesService";
import * as queueService from "./services/queueService";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "queue", label: "Cola", icon: Clock },
  { id: "employees", label: "Agentes", icon: Users },
  { id: "history", label: "Historial", icon: History },
];

const TAB_TITLES = {
  dashboard: "Vista general",
  queue: "Cola de espera",
  employees: "Gestión de agentes",
  history: "Historial de llamadas",
};

// Contador de IDs fuera del componente para que sobreviva los re-renders.
let nextCallId = 200;

export default function App() {
  const [tab, setTab] = useState("dashboard");

  // ── Estado compartido entre páginas (cargado vía services) ─────────────
  const [calls, setCalls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewCall, setShowNewCall] = useState(false);
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // ── Reloj del sidebar ────────────────────────────────────────────────
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Carga inicial de datos vía services (hoy mock, después backend real) ──
  useEffect(() => {
    Promise.all([
        callsService.getCalls(),
        employeesService.getEmployees(),
        queueService.getQueue(),
    ])
      .then(([callsData, employeesData, queueData]) => {
        const enrichedEmployees = employeesData.map((emp) => {
          const activeCall = callsData.find(
            (c) =>
              c.employeeId === emp.id &&
              (c.status === "active" || c.status === "escalated")
          );
          return activeCall
            ? { ...emp, active_call_id: activeCall.id }
            : emp;
        });

        setCalls(callsData);
        setEmployees(enrichedEmployees); 
        setQueue(queueData);
      })
      .catch((err) => console.error("Error cargando datos iniciales:", err))
      .finally(() => setLoading(false));
    }, []);

  // ── Helpers de agentes (puros, sin side-effects) ───────────────────────
 const findAgent = (emps, rankNeeded) =>
  emps.find(
    (e) =>
      e.is_active &&
      e.is_available &&
      !e.active_call_id &&
      e.rank >= rankNeeded
  );

  const freeAgent = (emps, callId) =>
  emps.map((e) =>
    e.active_call_id === callId
      ? { ...e, is_available: true, active_call_id: undefined }
      : e
  );

  const assignAgent = (emps, empId, callId) =>
  emps.map((e) =>
    e.id === empId
      ? { ...e, is_available: false, active_call_id: callId }  
      : e
  );

  // ── Handlers de llamadas ────────────────────────────────────────────────
  // Cada handler actualiza el estado local de inmediato y, además, avisa al
  // service correspondiente (hoy no hace nada real porque todo es mock; el
  // día que haya backend, el .catch ya está listo para manejar errores).

  const handleNewCall = async ({ caller_name, caller_phone, rank_required }) => {
  try {
    const now = new Date().toISOString();
    const match = findAgent(employees, rank_required);

    // crear la llamada en backend
    const savedCall = await callsService.createCall({
      caller_name,
      caller_phone,
      rank_required,
    });

    let finalCall = savedCall;

    // si hay agente, despachar automaticamente
    if (match) {
      const dispatchedCall = await callsService.dispatchCall(savedCall.id, match.id);

      //marcar el agente como ocupado en frontend
      setEmployees((prev) => assignAgent(prev, match.id, savedCall.id));

      //usar la respuesta real del backend
      finalCall = {
        ...dispatchedCall,
        employee_id: match.id,
        status: "active",
        started_at: dispatchedCall.started_at ?? now,
      };
    } else {
      //Si no hay agente, queda en cola
      setQueue((prev) => [
        ...prev,
        {
          id: `q-${savedCall.id}`,
          call_id: savedCall.id,
          priority: prev.length + 1,
          joined_at: now,
        },
      ]);

      finalCall = {
        ...savedCall,
        status: "queued",
      };
    }

    // Guardar en estado local
    setCalls((prev) => [finalCall, ...prev]);
  } catch (err) {
    console.error("Error creando llamada:", err);
  }
};

  const handleEscalate = async (callId) => {
    const call = calls.find((c) => c.id === callId);
    if (!call || call.rank_required >= 3) return;

    const newRank = call.rank_required + 1;
    let newEmps = freeAgent(employees, callId);
    const match = findAgent(newEmps, newRank);

    if (match) {
      newEmps = assignAgent(newEmps, match.id, callId);
    }

    setEmployees(newEmps);

    setCalls((prev) =>
      prev.map((c) =>
        c.id === callId
          ? {
              ...c,
              rank_required: newRank,
              status: match ? "escalated" : "queued",
              escalations: (c.escalations ?? 0) + 1,
              employee_id: match?.id ?? null,
            }
          : c
      )
    );

    if (!match) {
      setQueue((prev) =>
        prev.some((q) => q.call_id === callId)
          ? prev
          : [
              ...prev,
              {
                id: `q-esc-${callId}`,
                call_id: callId,
                priority: prev.length + 1,
                joined_at: new Date().toISOString(),
              },
            ]
      );
    }

    try {
      await callsService.escalateCall(callId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinish = (callId) => {
    setEmployees((prev) => freeAgent(prev, callId));

    setCalls(
      calls.map((c) =>
        c.id === callId
          ? {
              ...c,
              status: "finished",
              finished_at: new Date().toISOString(),
            }
          : c
      )
    );

    setQueue(queue.filter((q) => q.call_id !== callId));

    callsService.finishCall(callId).catch((err) => console.error(err));
  };

  const handleAssign = async (callId) => {
    const call = calls.find((c) => c.id === callId);
    if (!call) return;

    const match = findAgent(employees, call.rank_required);
    if (!match) return;

    setEmployees((prev) => assignAgent(prev, match.id, callId));

    setCalls((prev) =>
      prev.map((c) =>
        c.id === callId
          ? { ...c, employee_id: match.id, status: "escalated" }
          : c
      )
    );

    try {
      await callsService.assignAgent(callId, match.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatch = async (callId) => {
    try {
      const call = calls.find((c) => c.id === callId);
      if (!call) return;

      const match = findAgent(employees, call.rank_required);
      if (!match) return;

      const dispatched = await callsService.dispatchCall(callId, match.id);

      // Actualizar empleado con active_call_id para que el botón se deshabilite
      setEmployees((prev) => assignAgent(prev, match.id, callId));

      setCalls((prev) =>
        prev.map((c) =>
          c.id === callId
            ? { ...dispatched, status: "active" }
            : c
        )
      );

      // Sacar de la cola
      setQueue((prev) => prev.filter((q) => q.call_id !== callId));
    } catch (err) {
      console.error("Error despachando llamada:", err);
    }
  };

  // ── Handlers de agentes (descomentar cuando EmployeesPage exista) ──────
  const handleToggleAvailability = (employeeId) => {
    // Calculamos el nuevo valor antes de setState para pasárselo explícitamente
    // al service (el back espera { is_available: boolean }, no un "toggle").
    const current = employees.find((e) => e.id === employeeId);
    const newValue = current ? !current.is_available : true;

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId ? { ...e, is_available: newValue } : e
      )
    );

    employeesService
      .toggleAvailability(employeeId, newValue)
      .catch((err) => console.error(err));
  };

  const handleToggleActive = (employeeId) => {
    const current = employees.find((e) => e.id === employeeId);
    const newActiveValue = current ? !current.is_active : false;

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              is_active: newActiveValue,
              // Al desactivar un agente lo ponemos no disponible también
              is_available: newActiveValue ? e.is_available : false,
              active_call_id: newActiveValue ? e.active_call_id : undefined,
            }
          : e
      )
    );

    employeesService
      .toggleActive(employeeId, newActiveValue)
      .catch((err) => console.error(err));
  };

  const handleNewEmployee = ({ name, rank }) => {
    // Optimistic: mostramos el empleado de inmediato con un ID temporal.
    // Cuando el back responde con el UUID real, lo reemplazamos.
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      name,
      rank,
      is_available: true,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setEmployees((prev) => [...prev, optimistic]);

    employeesService
      .createEmployee({ name, rank })
      .then((saved) => {
        // Reemplazar el ID temporal por el UUID real del back
        setEmployees((prev) =>
          prev.map((e) => (e.id === tempId ? { ...optimistic, ...saved } : e))
        );
      })
      .catch((err) => {
        console.error(err);
        // Revertir si el back falló
        setEmployees((prev) => prev.filter((e) => e.id !== tempId));
      });
  };

  const handleEditEmployee = (employeeId, data) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId ? { ...e, ...data } : e
      )
    );

    employeesService
      .updateEmployee(employeeId, data)
      .catch((err) => console.error(err));
  };

  // ── Datos derivados para Sidebar/Header ─────────────────────────────────
  const activeCallsCount = calls.filter(
    (c) => c.status === "active" || c.status === "escalated"
  ).length;

  const tabsWithBadge = TABS.map((t) =>
    t.id === "queue" ? { ...t, badge: queue.length } : t
  );

  const callProps = {
    calls,
    employees,
    queue,
    onEscalate: handleEscalate,
    onFinish: handleFinish,
    onAssign: handleAssign,
    onDispatch: handleDispatch,
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        tabs={tabsWithBadge}
        activeTab={tab}
        onTabChange={setTab}
        activeCallsCount={activeCallsCount}
        clock={clock}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={TAB_TITLES[tab]}
          tabs={tabsWithBadge}
          activeTab={tab}
          onTabChange={setTab}
          onNewCall={() => setShowNewCall(true)}
        />

        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando datos...
            </p>
          ) : (
            <>
              {tab === "dashboard" && <DashboardPage {...callProps} />}

              {tab === "queue" && (
                <>
                  <QueuePage
                    queue={queue}
                    calls={calls}
                    employees={employees}
                    onDispatch={handleDispatch}
                  />
                </>
              )}

              {tab === "employees" && (
                <>
                  {/* TODO: cuando EmployeesPage esté lista, reemplaza <PlaceholderPage> por: */}
                  <EmployeesPage
                    employees={employees}
                    calls={calls}
                    onToggleAvailability={handleToggleAvailability}
                    onToggleActive={handleToggleActive}
                    onAdd={() => setShowNewEmployee(true)}
                    onEdit={(emp) => setEditingEmployee(emp)}
                  />
                </>
              )}

              {tab === "history" && <HistoryPage calls={calls} />}
            </>
          )}
        </main>
      </div>

      <NewCallModal
        isOpen={showNewCall}
        onClose={() => setShowNewCall(false)}
        onSubmit={handleNewCall}
      />

    {showNewEmployee && (
      <NewEmployeeModal
        isOpen={showNewEmployee}
        onClose={() => setShowNewEmployee(false)}
        onSubmit={handleNewEmployee}
      />
    )}

    {editingEmployee && (
      <EditEmployeeModal
        employee={editingEmployee}
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onSave={handleEditEmployee}
      />
    )}
    </div>
  );
}

function PlaceholderPage({ label }) {
  return (
    <div className="max-w-3xl bg-card border border-border rounded-xl p-10 text-center">
      <p className="text-sm text-muted-foreground">
        La página de{" "}
        <span className="font-medium text-foreground">{label}</span> todavía no
        está conectada.
      </p>
    </div>
  );
}