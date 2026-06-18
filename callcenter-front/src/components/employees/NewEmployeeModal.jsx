import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { RANK_LABELS } from "../../data/mockData";

const RANKS = [
  { id: 1, label: RANK_LABELS[1], desc: "Atiende llamadas de primer contacto" },
  { id: 2, label: RANK_LABELS[2], desc: "Recibe escalamientos de operadores" },
  { id: 3, label: RANK_LABELS[3], desc: "Máxima autoridad, recibe escalamientos" },
];

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSubmit: ({ name, rank }) => void
 */

export default function NewEmployeeModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [rank, setRank] = useState(1);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setRank(1);
      setTouched(false);
    }
  }, [isOpen]);

  const valid = name.trim().length > 0 && [1, 2, 3].includes(rank);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit({ name: name.trim(), rank });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo agente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Nombre completo</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: María García"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          {touched && name.trim().length === 0 && (
            <p className="text-xs text-red-500 mt-1">El nombre es requerido.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-3">Rango</label>

          <div className="flex flex-col gap-3">
            {RANKS.map((r) => {
              const selected = rank === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRank(r.id)}
                  className={`w-full text-left rounded-lg px-4 py-3 flex items-start gap-3 transition-colors border ${
                    selected ? "ring-2 ring-indigo-300 bg-indigo-50 border-indigo-200" : "bg-white border-border hover:bg-secondary"
                  }`}
                  aria-pressed={selected}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    selected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
                  }`}>
                    {r.id}
                  </div>

                  <div className="flex-1">
                    <div className={`font-medium ${selected ? "text-foreground" : "text-foreground"}`}>{r.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                  </div>
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
              valid ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"
            }`}
          >
            Crear agente
          </button>
        </div>
      </form>
    </Modal>
  );
}