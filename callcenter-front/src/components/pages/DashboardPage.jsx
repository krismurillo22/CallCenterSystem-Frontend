import { useState, useEffect } from "react";
import {
  PhoneCall, Clock, Users, AlertTriangle,
  ChevronUp, CheckCircle, PhoneIncoming, TrendingUp,
} from "lucide-react";

// ─── Mock data ──────────────────────────────────────────────────────────────
const RANK_LABELS = { 1: "Agente", 2: "Supervisor", 3: "Gerente" };

const initialCalls = [
  { id: 101, caller_name: "Carlos Mendoza",  caller_phone: "555-1234", rank_required: 1, status: "active",   started_at: new Date(Date.now() - 320000).toISOString(), employee_id: "emp-1", escalations: 0 },
  { id: 102, caller_name: "Ana López",        caller_phone: "555-5678", rank_required: 2, status: "escalated", started_at: new Date(Date.now() - 610000).toISOString(), employee_id: "emp-3", escalations: 1 },
  { id: 103, caller_name: "Roberto Silva",    caller_phone: "555-9012", rank_required: 1, status: "queue",    started_at: new Date(Date.now() - 125000).toISOString(), escalations: 0 },
  { id: 104, caller_name: "María García",     caller_phone: "555-3456", rank_required: 3, status: "escalated", started_at: new Date(Date.now() - 920000).toISOString(), employee_id: "emp-5", escalations: 2 },
  { id: 105, caller_name: "Juan Torres",      caller_phone: "555-7890", rank_required: 1, status: "finished", started_at: new Date(Date.now() - 1800000).toISOString(), finished_at: new Date(Date.now() - 300000).toISOString(), employee_id: "emp-2", escalations: 0 },
];

const initialEmployees = [
  { id: "emp-1", name: "Luis Torres",    rank: 1, is_available: false, is_active: true, active_call_id: 101 },
  { id: "emp-2", name: "Sofia Ramírez",  rank: 1, is_available: true,  is_active: true },
  { id: "emp-3", name: "Diego Herrera",  rank: 2, is_available: false, is_active: true, active_call_id: 102 },
  { id: "emp-4", name: "Carmen Vega",    rank: 2, is_available: true,  is_active: true },
  { id: "emp-5", name: "Eduardo Mora",   rank: 3, is_available: false, is_active: true, active_call_id: 104 },
  { id: "emp-6", name: "Patricia Luna",  rank: 3, is_available: true,  is_active: true },
];

const initialQueue = [
  { id: "q-103", call_id: 103, priority: 1, joined_at: new Date(Date.now() - 125000).toISOString() },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmtDuration(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  return `hace ${Math.floor(m / 60)}h`;
}

// ─── Shared components ───────────────────────────────────────────────────────
function RankBadge({ rank }) {
  const cls = {
    1: "bg-slate-100 text-slate-600",
    2: "bg-indigo-50 text-indigo-600",
    3: "bg-amber-50 text-amber-700",
  }[rank];
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{RANK_LABELS[rank]}</span>;
}

// ─── KpiCards ───────────────────────────────────────────────────────────────
function KpiCards({ calls, employees }) {
  const active    = calls.filter(c => c.status === "active" || c.status === "escalated").length;
  const inQueue   = calls.filter(c => c.status === "queue").length;
  const totalAct  = employees.filter(e => e.is_active).length;
  const available = employees.filter(e => e.is_available && e.is_active).length;
  const escalated = calls.filter(c => c.escalations > 0 && c.status !== "finished").length;

  const cards = [
    { label: "Llamadas activas",    value: active,                        Icon: PhoneCall,    bg: "bg-indigo-50",  ic: "text-indigo-500",  val: "text-indigo-700" },
    { label: "En cola",             value: inQueue,                       Icon: Clock,        bg: "bg-amber-50",   ic: "text-amber-500",   val: "text-amber-700" },
    { label: "Agentes disponibles", value: `${available}/${totalAct}`,    Icon: Users,        bg: "bg-emerald-50", ic: "text-emerald-500", val: "text-emerald-700" },
    { label: "Con escalaciones",    value: escalated,                     Icon: TrendingUp,   bg: "bg-rose-50",    ic: "text-rose-500",    val: "text-rose-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, Icon, bg, ic, val }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
            <div className={`${bg} p-2 rounded-lg`}>
              <Icon size={14} className={ic} />
            </div>
          </div>
          <p className={`text-2xl font-semibold tabular-nums ${val}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── ActiveCallsTable ────────────────────────────────────────────────────────
function ActiveCallsTable({ calls, employees, onEscalate, onFinish, onAssign }) {
  const active = calls.filter(c => c.status === "active" || c.status === "escalated");

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-sm text-gray-900">Llamadas activas</h3>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="text-xs text-gray-400">{active.length} en curso</span>
      </div>

      {active.length === 0 ? (
        <div className="py-10 text-center">
          <PhoneCall size={22} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Sin llamadas activas</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {active.map(call => {
            const emp = employees.find(e => e.id === call.employee_id);
            return (
              <div key={call.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${call.status === "escalated" ? "bg-amber-400" : "bg-emerald-400"}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-gray-900 truncate">{call.caller_name}</span>
                    {call.escalations > 0 && (
                      <span className="shrink-0 text-xs bg-rose-50 text-rose-500 font-medium px-1.5 py-0.5 rounded-full">
                        ↑{call.escalations}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">{call.caller_phone}</span>
                    <span className="text-gray-200 text-xs">·</span>
                    <RankBadge rank={call.rank_required} />
                    {emp ? (
                      <>
                        <span className="text-gray-200 text-xs">·</span>
                        <span className="text-xs text-gray-500">{emp.name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-rose-400 font-medium">Sin agente</span>
                    )}
                  </div>
                </div>

                <span className="font-mono text-sm text-gray-600 tabular-nums shrink-0">
                  {fmtDuration(call.started_at)}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!emp && (
                    <button
                      onClick={() => onAssign(call.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium"
                    >
                      Asignar
                    </button>
                  )}
                  {call.rank_required < 3 && (
                    <button
                      onClick={() => onEscalate(call.id)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      <ChevronUp size={11} />
                      Escalar
                    </button>
                  )}
                  <button
                    onClick={() => onFinish(call.id)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle size={11} />
                    Finalizar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CallQueuePanel ──────────────────────────────────────────────────────────
function CallQueuePanel({ queue, calls, employees, onDispatch }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900">Cola de espera</h3>
        {queue.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {queue.length}
          </span>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="py-8 text-center">
          <Clock size={20} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Cola vacía</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {queue.map((q, i) => {
            const call = calls.find(c => c.id === q.call_id);
            if (!call) return null;
            const canDispatch = employees.some(e => e.is_available && e.is_active && e.rank >= call.rank_required);
            return (
              <div key={q.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-400 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{call.caller_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">{call.caller_phone}</span>
                    <span className="text-gray-200 text-xs">·</span>
                    <RankBadge rank={call.rank_required} />
                    <span className="text-gray-200 text-xs">·</span>
                    <span className="text-xs text-amber-600 font-medium tabular-nums">
                      {fmtDuration(q.joined_at)} esp.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDispatch(call.id)}
                  disabled={!canDispatch}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Despachar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── AvailabilityBars ────────────────────────────────────────────────────────
function AvailabilityBars({ employees }) {
  const ranks = [
    { rank: 1, bar: "bg-slate-400",  text: "text-slate-600",  avBg: "bg-slate-400"  },
    { rank: 2, bar: "bg-indigo-500", text: "text-indigo-600", avBg: "bg-indigo-500" },
    { rank: 3, bar: "bg-amber-400",  text: "text-amber-600",  avBg: "bg-amber-400"  },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-sm text-gray-900 mb-5">Disponibilidad por rango</h3>
      <div className="flex flex-col gap-5">
        {ranks.map(({ rank, bar, text, avBg }) => {
          const group = employees.filter(e => e.rank === rank && e.is_active);
          const avail = group.filter(e => e.is_available).length;
          const pct   = group.length > 0 ? (avail / group.length) * 100 : 0;
          return (
            <div key={rank}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700">{RANK_LABELS[rank]}</span>
                <span className={`text-xs font-semibold ${text}`}>{avail}/{group.length}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {group.map(e => (
                  <div
                    key={e.id}
                    title={e.name}
                    className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-semibold transition-colors ${
                      e.is_available ? `${avBg} text-white` : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {e.name[0]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── EscalationLog ───────────────────────────────────────────────────────────
function EscalationLog({ calls }) {
  const log = calls
    .filter(c => c.escalations > 0)
    .sort((a, b) => b.escalations - a.escalations)
    .slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-sm text-gray-900 mb-4">Log de escalaciones</h3>
      {log.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Sin escalaciones</p>
      ) : (
        <div className="flex flex-col gap-3">
          {log.map(call => (
            <div key={call.id} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={12} className="text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-tight truncate">{call.caller_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">{timeAgo(call.started_at)}</span>
                  <span className="text-gray-200 text-xs">·</span>
                  <span className="text-xs text-rose-500 font-medium">{call.escalations} esc.</span>
                  <span className="text-gray-200 text-xs">·</span>
                  <RankBadge rank={call.rank_required} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DashboardPage ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [calls,     setCalls]     = useState(initialCalls);
  const [employees, setEmployees] = useState(initialEmployees);
  const [queue,     setQueue]     = useState(initialQueue);
  const [, setTick] = useState(0);

  // Reloj para actualizar duraciones cada segundo
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Helpers de estado ─────────────────────────────────────────────────────
  const findAgent   = (emps, rank) => emps.find(e => e.is_active && e.is_available && e.rank >= rank);
  const freeAgent   = (emps, callId) => emps.map(e => e.active_call_id === callId ? { ...e, is_available: true, active_call_id: undefined } : e);
  const assignAgent = (emps, empId, callId) => emps.map(e => e.id === empId ? { ...e, is_available: false, active_call_id: callId } : e);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
    setEmployees(freeAgent(employees, callId));
    setCalls(calls.map(c => c.id === callId ? { ...c, status: "finished", finished_at: new Date().toISOString() } : c));
    setQueue(queue.filter(q => q.call_id !== callId));
  };

  const handleAssign = (callId) => {
    const call = calls.find(c => c.id === callId);
    if (!call) return;
    const match = findAgent(employees, call.rank_required);
    if (!match) return;
    setEmployees(assignAgent(employees, match.id, callId));
    setCalls(calls.map(c => c.id === callId ? { ...c, employee_id: match.id, status: "escalated" } : c));
  };

  const handleDispatch = (callId) => {
    const call = calls.find(c => c.id === callId);
    if (!call) return;
    const match = findAgent(employees, call.rank_required);
    if (!match) return;
    setEmployees(assignAgent(employees, match.id, callId));
    setCalls(calls.map(c => c.id === callId ? { ...c, status: "active", employee_id: match.id } : c));
    setQueue(queue.filter(q => q.call_id !== callId));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vista general</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          <PhoneIncoming size={14} />
          Nueva llamada
        </button>
      </div>

      {/* KPIs */}
      <KpiCards calls={calls} employees={employees} />

      {/* Main grid: 2/3 left + 1/3 right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <ActiveCallsTable
            calls={calls}
            employees={employees}
            onEscalate={handleEscalate}
            onFinish={handleFinish}
            onAssign={handleAssign}
          />
          <CallQueuePanel
            queue={queue}
            calls={calls}
            employees={employees}
            onDispatch={handleDispatch}
          />
        </div>
        <div className="flex flex-col gap-6">
          <AvailabilityBars employees={employees} />
          <EscalationLog calls={calls} />
        </div>
      </div>
    </div>
  );
}