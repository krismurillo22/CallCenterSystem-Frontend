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
// import HistoryPage from "./components/pages/HistoryPage";
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
        setCalls(callsData);
        setEmployees(employeesData);
        setQueue(queueData);
      })
      .catch((err) => console.error("Error cargando datos iniciales:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Helpers de agentes (puros, sin side-effects) ───────────────────────
  const findAgent = (emps, rankNeeded) =>
    emps.find((e) => e.is_active && e.is_available && e.rank >= rankNeeded);

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

  const handleNewCall = ({ caller_name, caller_phone, rank_required }) => {
    const id = nextCallId++;
    const now = new Date().toISOString();
    const match = findAgent(employees, rank_required);

    const newCall = {
      id,
      caller_name,
      caller_phone,
      rank_required,
      status: match ? "active" : "queue",
      started_at: now,
      employee_id: match?.id,
      escalations: 0,
    };

    if (match) {
      setEmployees((prev) => assignAgent(prev, match.id, id));
    } else {
      setQueue((prev) => [
        ...prev,
        {
          id: `q-${id}`,
          call_id: id,
          priority: prev.length + 1,
          joined_at: now,
        },
      ]);
    }

    setCalls((prev) => [newCall, ...prev]);

    callsService
      .createCall({ caller_name, caller_phone, rank_required })
      .catch((err) => console.error(err));
  };

  const handleEscalate = (callId) => {
    const call = calls.find((c) => c.id === callId);
    if (!call || call.rank_required >= 3) return;

    const newRank = call.rank_required + 1;
    let newEmps = freeAgent(employees, callId);
    const match = findAgent(newEmps, newRank);

    if (match) newEmps = assignAgent(newEmps, match.id, callId);

    setEmployees(newEmps);

    setCalls(
      calls.map((c) =>
        c.id === callId
          ? {
              ...c,
              rank_required: newRank,
              status: match ? "escalated" : "queue",
              escalations: c.escalations + 1,
              employee_id: match?.id,
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

    callsService.escalateCall(callId).catch((err) => console.error(err));
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

  const handleAssign = (callId) => {
    const call = calls.find((c) => c.id === callId);
    if (!call) return;

    const match = findAgent(employees, call.rank_required);
    if (!match) return;

    setEmployees((prev) => assignAgent(prev, match.id, callId));

    setCalls(
      calls.map((c) =>
        c.id === callId
          ? { ...c, employee_id: match.id, status: "escalated" }
          : c
      )
    );

    callsService.assignAgent(callId, match.id).catch((err) => console.error(err));
  };

  const handleDispatch = (callId) => {
    const call = calls.find((c) => c.id === callId);
    if (!call) return;

    const match = findAgent(employees, call.rank_required);
    if (!match) return;

    setEmployees((prev) => assignAgent(prev, match.id, callId));

    setCalls(
      calls.map((c) =>
        c.id === callId
          ? { ...c, status: "active", employee_id: match.id }
          : c
      )
    );

    setQueue(queue.filter((q) => q.call_id !== callId));

    callsService.dispatchCall(callId, match.id).catch((err) => console.error(err));
  };

  // ── Handlers de agentes (descomentar cuando EmployeesPage exista) ──────
  const handleToggleAvailability = (employeeId) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? { ...e, is_available: !e.is_available }
          : e
      )
    );

    employeesService
      .toggleAvailability(employeeId)
      .catch((err) => console.error(err));
  };

  const handleToggleActive = (employeeId) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              is_active: !e.is_active,
              is_available: false,
              active_call_id: undefined,
            }
          : e
      )
    );

    employeesService.toggleActive(employeeId).catch((err) => console.error(err));
  };

  const handleNewEmployee = ({ name, rank }) => {
    const newEmp = {
      id: `emp-${Date.now()}`,
      name,
      rank,
      is_available: true,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setEmployees((prev) => [...prev, newEmp]);

    employeesService
      .createEmployee({ name, rank })
      .catch((err) => console.error(err));
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

              {tab === "history" && (
                <>
                  {/* TODO: cuando HistoryPage esté lista, reemplaza <PlaceholderPage> por:
                      <HistoryPage calls={calls} /> */}
                  <PlaceholderPage label="Historial" />
                </>
              )}
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