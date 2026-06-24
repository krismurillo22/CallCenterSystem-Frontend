import { useState, useEffect } from "react";
import Modal from "../ui/Modal";

const RANKS = [
  { id: 1, label: "Operador", color: "text-slate-700", bg: "bg-slate-100" },
  { id: 2, label: "Supervisor", color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: 3, label: "Gerente", color: "text-amber-600", bg: "bg-amber-50" },
];

export default function NewCallModal({ isOpen, onClose, onSubmit }) {
  const [callerName, setCallerName] = useState("");
  const [callerPhone, setCallerPhone] = useState("");
  const [rank, setRank] = useState(1);
  const [touched, setTouched] = useState(false);

  // Validación para número de Honduras:
  // acepta 99998888, 89998888, +50499998888, +504 99998888
  const phoneRegex = /^(?:\+504\s?)?[2389]\d{7}$/;
  const isPhoneValid = phoneRegex.test(callerPhone.trim());

  const valid =
    callerName.trim().length > 0 &&
    isPhoneValid &&
    [1, 2, 3].includes(rank);

  useEffect(() => {
    if (!isOpen) {
      setCallerName("");
      setCallerPhone("");
      setRank(1);
      setTouched(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (!valid) return;

    onSubmit({
      caller_name: callerName.trim(),
      caller_phone: callerPhone.trim(),
      rank_required: rank,
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva llamada entrante">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Nombre del llamante
          </label>

          <input
            autoFocus
            value={callerName}
            onChange={(e) => setCallerName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
              touched && callerName.trim().length === 0
                ? "border-red-500"
                : "border-border"
            }`}
          />

          {touched && callerName.trim().length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              El nombre es requerido.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Teléfono
          </label>

          <input
            value={callerPhone}
            onChange={(e) => setCallerPhone(e.target.value)}
            placeholder="+504 99998888"
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
              touched && !isPhoneValid
                ? "border-red-500"
                : "border-border"
            }`}
          />

          {touched && callerPhone.trim().length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              El teléfono es requerido.
            </p>
          )}

          {touched && callerPhone.trim().length > 0 && !isPhoneValid && (
            <p className="text-xs text-red-500 mt-1">
              Ingresa un número de teléfono válido. Ejemplo: 99998888 o +504
              99998888.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Rango requerido
          </label>

          <div className="flex gap-3">
            {RANKS.map((r) => {
              const selected = rank === r.id;

              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRank(r.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                    selected
                      ? `ring-2 ring-indigo-300 ${r.bg}`
                      : "bg-white hover:bg-secondary"
                  } ${r.color} ${selected ? "" : "border-border"}`}
                  aria-pressed={selected}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!valid}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
              valid
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-emerald-300 cursor-not-allowed"
            }`}
          >
            Registrar llamada
          </button>
        </div>
      </form>
    </Modal>
  );
}