import { useState, useEffect } from "react";
import { PhoneCall, LayoutDashboard, Users, Clock, History, PhoneIncoming } from "lucide-react";

// ── Páginas ────────────────────────────────────────────────────────────────
import DashboardPage  from "./components/pages/DashboardPage";
//import QueuePage      from "./pages/QueuePage";
//import EmployeesPage  from "./pages/EmployeesPage";
// import HistoryPage    from "./pages/HistoryPage";

// ── Modales globales ───────────────────────────────────────────────────────
//import NewCallModal     from "./components/calls/NewCallModal";
//import NewEmployeeModal from "./components/employees/NewEmployeeModal";
//import EditEmployeeModal from "./components/employees/EditEmployeeModal";

// ── Datos iniciales y tipos ────────────────────────────────────────────────
//import {
//  initialCalls,
//  initialEmployees,
//  initialQueue,
//} from "./data/mockData";

// ─────────────────────────────────────────────────────────────────────────────
let nextCallId = 200; // contador de IDs fuera del componente para no perderlo en re-renders

export default function App() {
  // ── Estado global (compartido entre todas las páginas) ─────────────────
  const [calls,     setCalls]     = useState(initialCalls);
  const [employees, setEmployees] = useState(initialEmployees);
  const [queue,     setQueue]     = useState(initialQueue);

  // ── Navegación ─────────────────────────────────────────────────────────
  const [tab, setTab] = useState("dashboard");

  // ── Modales ────────────────────────────────────────────────────────────
  const [showNewCall,      setShowNewCall]      = useState(false);
  const [showNewEmployee,  setShowNewEmployee]  = useState(false);
  const [editingEmployee,  setEditingEmployee]  = useState(null);

  // ── Reloj del sidebar ──────────────────────────────────────────────────
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Helpers de agentes ─────────────────────────────────────────────────
  const findAgent   = (emps, rank)         => emps.find(e => e.is_active && e.is_available && e.rank >= rank);
  const freeAgent   = (emps, callId)       => emps.map(e => e.active_call_id === callId ? { ...e, is_available: true, active_call_id: undefined } : e);
  const assignAgent = (emps, empId, callId) => emps.map(e => e.id === empId ? { ...e, is_available: false, active_call_id: callId } : e);

  // ── Handlers de llamadas ───────────────────────────────────────────────
  const handleNewCall = ({ caller_name, caller_phone, rank_required }) => {
    const id    = nextCallId++;
    const now   = new Date().toISOString();
    const match = findAgent(employees, rank_required);
    const newCall = {
      id, caller_name, caller_phone, rank_required,
      status: match ? "active" : "queue",
      started_at: now,
      employee_id: match?.id,
      escalations: 0,
    };
    if (match) setEmployees(prev => assignAgent(prev, match.id, id));
    else setQueue(prev => [...prev, { id: `q-${id}`, call_id: id, priority: prev.length + 1, joined_at: now }]);
    setCalls(prev => [newCall, ...prev]);
  };

  const handleEscalate = (callId) => {
    const call = calls.find(c => c.id === callId);
    if (!call || call.rank_required >= 3) return;
    const newRank = call.rank_required + 1;
    let newEmps   = freeAgent(employees, callId);
    const match   = findAgent(newEmps, newRank);
    if (match) newEmps = assignAgent(newEmps, match.id, callId);
    setEmployees(newEmps);
    setCalls(calls.map(c =>
      c.id === callId
        ? { ...c, rank_required: newRank, status: match ? "escalated" : "queue", escalations: c.escalations + 1, employee_id: match?.id }
        : c
    ));
    if (!match) {
      setQueue(prev =>
        prev.some(q => q.call_id === callId)
          ? prev
          : [...prev, { id: `q-esc-${callId}`, call_id: callId, priority: prev.length + 1, joined_at: new Date().toISOString() }]
      );
    }
  };

  const handleFinish = (callId) => {
    setEmployees(prev => freeAgent(prev, callId));
    setCalls(calls.map(c => c.id === callId ? { ...c, status: "finished", finished_at: new Date().toISOString() } : c));
    setQueue(queue.filter(q => q.call_id !== callId));
  };

  const handleAssign = (callId) => {
    const call  = calls.find(c => c.id === callId);
    if (!call) return;
    const match = findAgent(employees, call.rank_required);
    if (!match) return;
    setEmployees(prev => assignAgent(prev, match.id, callId));
    setCalls(calls.map(c => c.id === callId ? { ...c, employee_id: match.id, status: "escalated" } : c));
  };

  const handleDispatch = (callId) => {
    const call  = calls.find(c => c.id === callId);
    if (!call) return;
    const match = findAgent(employees, call.rank_required);
    if (!match) return;
    setEmployees(prev => assignAgent(prev, match.id, callId));
    setCalls(calls.map(c => c.id === callId ? { ...c, status: "active", employee_id: match.id } : c));
    setQueue(queue.filter(q => q.call_id !== callId));
  };

  // ── Handlers de empleados ──────────────────────────────────────────────
  const handleNewEmployee = ({ name, rank }) => {
    const newEmp = {
      id: `emp-${Date.now()}`,
      name, rank,
      is_available: true,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const handleEditEmployee = (id, { name, rank }) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, name, rank } : e));
  };

  const handleToggleAvailability = (empId) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, is_available: !e.is_available } : e));
  };

  const handleToggleActive = (empId) => {
    setEmployees(prev => prev.map(e =>
      e.id === empId ? { ...e, is_active: !e.is_active, is_available: false } : e
    ));
  };

  // ── Datos derivados para el sidebar ───────────────────────────────────
  const activeCalls = calls.filter(c => c.status === "active" || c.status === "escalated").length;

  const tabs = [
    { id: "dashboard", label: "Dashboard",  Icon: LayoutDashboard },
    { id: "queue",     label: "Cola",       Icon: Clock,    badge: queue.length },
    { id: "employees", label: "Agentes",    Icon: Users },
    { id: "history",   label: "Historial",  Icon: History },
  ];

  const TAB_TITLES = {
    dashboard:  "Vista general",
    queue:      "Cola de espera",
    employees:  "Gestión de agentes",
    history:    "Historial de llamadas",
  };

  // ── Props que se pasan a cada página ──────────────────────────────────
  const callProps = { calls, employees, queue, onEscalate: handleEscalate, onFinish: handleFinish, onAssign: handleAssign, onDispatch: handleDispatch };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-56 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <PhoneCall size={15} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">CallCenter</p>
              <p className="text-xs text-gray-400">Operaciones</p>
            </div>
          </div>
        </div>

        {/* Indicador de llamadas activas */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="bg-emerald-50 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-xs text-emerald-700">
              <span className="font-semibold">{activeCalls}</span> llamadas activas
            </p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {tabs.map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === id
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={16} />
              {label}
              {badge > 0 && (
                <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Reloj */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Hora actual</p>
          <p className="font-mono font-medium text-gray-900 tabular-nums mt-0.5">
            {clock.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-semibold text-gray-900">{TAB_TITLES[tab]}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => setShowNewCall(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <PhoneIncoming size={14} />
            Nueva llamada
          </button>
        </header>

        {/* Páginas */}
        <main className="flex-1 overflow-auto">
          {tab === "dashboard" && (
            <DashboardPage {...callProps} />
          )}
          {tab === "queue" && (
            <QueuePage queue={queue} calls={calls} employees={employees} onDispatch={handleDispatch} />
          )}
          {tab === "employees" && (
            <EmployeesPage
              employees={employees}
              calls={calls}
              onToggleAvailability={handleToggleAvailability}
              onEdit={(emp) => setEditingEmployee(emp)}
              onToggleActive={handleToggleActive}
              onAdd={() => setShowNewEmployee(true)}
            />
          )}
          {tab === "history" && (
            <HistoryPage calls={calls} />
          )}
        </main>
      </div>

      {/* ── Modales globales ─────────────────────────────────────────── */}
      {showNewCall && (
        <NewCallModal
          onClose={() => setShowNewCall(false)}
          onSubmit={handleNewCall}
        />
      )}
      {showNewEmployee && (
        <NewEmployeeModal
          onClose={() => setShowNewEmployee(false)}
          onSubmit={handleNewEmployee}
        />
      )}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={handleEditEmployee}
        />
      )}

    </div>
  );
}
