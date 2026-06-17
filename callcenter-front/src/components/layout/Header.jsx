import { PhoneIncoming } from "lucide-react";

/**
 * @param {{
 *   title: string,
 *   tabs: { id: string, label: string, icon: React.ElementType }[],
 *   activeTab: string,
 *   onTabChange: (id: string) => void,
 *   onNewCall: () => void,
 * }} props
 */
export function Header({ title, tabs, activeTab, onTabChange, onNewCall }) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
      <div>
        <h1 className="font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Navegación en mobile (la sidebar se oculta bajo md:) */}
        <div className="flex md:hidden items-center gap-1 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === t.id ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={onNewCall}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <PhoneIncoming size={14} />
          Nueva llamada
        </button>
      </div>
    </header>
  );
}

export default Header;
