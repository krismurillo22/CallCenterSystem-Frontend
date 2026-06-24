import { useMemo, useState } from "react";
import { History, Search, X } from "lucide-react";
import { StatusBadge, RankBadge } from "../common/StatusBadge";
import { getElapsed, RANK_LABELS } from "../../data/mockData";

const RANK_OPTIONS = [1, 2, 3];

export default function HistoryPage({ calls = [] }) {
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("all");
  const [escalatedOnly, setEscalatedOnly] = useState(false);

  const finished = useMemo(() => {
    return calls.filter((c) => {
      const status = String(c.status ?? "").toLowerCase();
      return status === "finished" || status === "finish";
    });
  }, [calls]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return finished.filter((call) => {
      const callerName = String(call.caller_name ?? "").toLowerCase();
      const callerPhone = String(call.caller_phone ?? "").toLowerCase();
      const id = String(call.id ?? "").toLowerCase();

      const rank = Number(call.rank_required ?? 0);
      const escalations = Number(call.escalations ?? 0);

      const matchesSearch =
        term === "" ||
        callerName.includes(term) ||
        callerPhone.includes(term) ||
        id.includes(term);

      const matchesRank =
        rankFilter === "all" || rank === Number(rankFilter);

      const matchesEscalated =
        !escalatedOnly || escalations > 0;

      return matchesSearch && matchesRank && matchesEscalated;
    });
  }, [finished, search, rankFilter, escalatedOnly]);

  const hasActiveFilters =
    search.trim() !== "" || rankFilter !== "all" || escalatedOnly;

  const clearFilters = () => {
    setSearch("");
    setRankFilter("all");
    setEscalatedOnly(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <History size={15} className="text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">
              Historial de llamadas
            </span>
          </div>

          <span className="text-xs text-muted-foreground">
            {filtered.length} de {finished.length} finalizadas
          </span>
        </div>

        <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center gap-3 bg-secondary/20">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o ID..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>

          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          >
            <option value="all">Todos los rangos</option>
            {RANK_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {RANK_LABELS[r] ?? `Rango ${r}`}
              </option>
            ))}
          </select>

          <button
            onClick={() => setEscalatedOnly((v) => !v)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
              escalatedOnly
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-card border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            Solo con escalaciones
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              <X size={13} />
              Limpiar
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {finished.length === 0
              ? "Sin historial"
              : "No hay resultados para esos filtros"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {[
                    "Llamante",
                    "Teléfono",
                    "Rango",
                    "Inicio",
                    "Fin",
                    "Duración",
                    "Escal.",
                    "Estado",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filtered.map((call) => {
                  const startedAt = call.started_at ?? call.startedAt;
                  const finishedAt = call.finished_at ?? call.finishedAt;
                  const escalations = Number(call.escalations ?? 0);

                  return (
                    <tr
                      key={call.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-foreground">
                          {call.caller_name ?? "Sin nombre"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          #{call.id}
                        </div>
                      </td>

                      <td
                        className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {call.caller_phone ?? "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <RankBadge rank={Number(call.rank_required ?? 1)} />
                      </td>

                      <td
                        className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {startedAt
                          ? new Date(startedAt).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>

                      <td
                        className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {finishedAt
                          ? new Date(finishedAt).toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>

                      <td
                        className="px-5 py-3.5 text-xs text-muted-foreground"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {startedAt && finishedAt
                          ? getElapsed(startedAt, finishedAt)
                          : "—"}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {escalations > 0 ? (
                          <span className="text-xs text-amber-600 font-medium">
                            {escalations}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status={call.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}