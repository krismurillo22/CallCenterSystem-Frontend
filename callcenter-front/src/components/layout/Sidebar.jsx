import { PhoneCall } from "lucide-react";

/**
 * Barra lateral con navegación entre páginas. Se queda oculta en mobile
 * (el menú de tabs equivalente vive en el Header).
 *
 * @param {{
 *   tabs: { id: string, label: string, icon: React.ElementType, badge?: number }[],
 *   activeTab: string,
 *   onTabChange: (id: string) => void,
 *   activeCallsCount: number,
 *   clock: Date,
 * }} props
 */
export function Sidebar({ tabs, activeTab, onTabChange, activeCallsCount, clock }) {
  return (
    <aside className="w-56 bg-card border-r border-border flex-col shrink-0 hidden md:flex">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <PhoneCall size={15} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">CallCenter</div>
            <div className="text-xs text-muted-foreground">Operaciones</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border">
        <div className="bg-emerald-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="text-xs text-emerald-700">
            <span className="font-semibold">{activeCallsCount}</span> llamadas activas
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activeTab === t.id
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-medium px-1.5 py-0.5 rounded-full min-w-5 text-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <div className="text-xs text-muted-foreground">Hora actual</div>
        <div className="font-medium text-foreground tabular-nums mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
          {clock.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
