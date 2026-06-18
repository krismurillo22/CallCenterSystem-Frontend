import { useState, useRef, useEffect } from "react";
import { Phone, Plus, Pencil, PowerOff, Power, MoreVertical } from "lucide-react";
import { AvailabilityDot, RankBadge } from "../common/StatusBadge";
import { RANK_LABELS } from "../../data/mockData";

function ContextMenu({ onEdit, onDeactivate, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-xl shadow-lg py-1 w-40 overflow-hidden">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <Pencil size={13} className="text-indigo-500" />
            Editar
          </button>

          <div className="h-px bg-border mx-2 my-1" />

          <button
            onClick={() => {
              onDeactivate();
              setOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
              isActive
                ? "text-red-600 hover:bg-red-50"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {isActive ? <PowerOff size={13} /> : <Power size={13} />}
            {isActive ? "Desactivar" : "Activar"}
          </button>
        </div>
      )}
    </div>
  );
}

function EmployeeCard({ emp, activeCall, onToggle, onEdit, onToggleActive }) {
  const inactive = !emp.is_active;

  return (
    <div
      className={`rounded-xl border transition-all p-4 flex flex-col gap-3 ${
        inactive
          ? "bg-secondary/50 border-border opacity-60"
          : emp.is_available
          ? "bg-card border-emerald-200 shadow-sm shadow-emerald-50"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {inactive ? (
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0" />
          ) : (
            <AvailabilityDot available={emp.is_available} />
          )}

          <RankBadge rank={emp.rank} />
        </div>

        <ContextMenu
          onEdit={onEdit}
          onDeactivate={onToggleActive}
          isActive={emp.is_active}
        />
      </div>

      <div>
        <div
          className={`font-semibold text-sm ${
            inactive ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {emp.name}
        </div>

        {inactive && (
          <span className="text-[11px] text-red-500 font-medium">
            Inactivo
          </span>
        )}
      </div>

      {!inactive && (
        <button
          onClick={onToggle}
          disabled={!!emp.active_call_id}
          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors w-full text-center ${
            emp.active_call_id
              ? "bg-secondary text-muted-foreground cursor-default"
              : emp.is_available
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-secondary text-muted-foreground hover:bg-gray-200"
          }`}
        >
          {emp.active_call_id
            ? "En llamada"
            : emp.is_available
            ? "Disponible"
            : "Ocupado"}
        </button>
      )}

      {activeCall && !inactive && (
        <div className="flex items-center gap-1.5 bg-indigo-50 rounded-lg px-2.5 py-1.5">
          <Phone size={11} className="text-indigo-400 shrink-0" />
          <span className="text-xs text-indigo-700 truncate">
            {activeCall.caller_name}
          </span>
        </div>
      )}
    </div>
  );
}

const rankBorderColor = {
  1: "border-l-slate-300",
  2: "border-l-indigo-400",
  3: "border-l-amber-400",
};

export default function EmployeeGrid({
  employees,
  calls,
  onToggleAvailability,
  onEdit,
  onToggleActive,
  onAdd,
}) {
  const ranks = [1, 2, 3];

  return (
    <div className="flex flex-col gap-8">
      {ranks.map((rank) => {
        const group = employees.filter((e) => e.rank === rank);
        const active = group.filter((e) => e.is_active);
        const available = active.filter((e) => e.is_available).length;

        return (
          <div key={rank}>
            <div
              className={`flex items-center gap-3 mb-4 pl-3 border-l-4 ${rankBorderColor[rank]}`}
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">
                  {RANK_LABELS[rank]}s
                </h3>

                <p className="text-xs text-muted-foreground">
                  {available} disponibles · {active.length} activos ·{" "}
                  {group.length} total
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {group.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  emp={emp}
                  activeCall={calls.find((c) => c.id === emp.active_call_id)}
                  onToggle={() => onToggleAvailability(emp.id)}
                  onEdit={() => onEdit(emp)}
                  onToggleActive={() => onToggleActive(emp.id)}
                />
              ))}

              <button
                onClick={onAdd}
                className="rounded-xl border-2 border-dashed border-border hover:border-indigo-300 hover:bg-indigo-50/50 transition-all p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-indigo-500 min-h-[110px]"
              >
                <Plus size={20} />
                <span className="text-xs font-medium">Agregar</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}