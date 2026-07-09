export type AdminView = "list" | "create";

interface AdminSidebarProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
}

const NAV_ITEMS: { view: AdminView; label: string; icon: string }[] = [
  { view: "list", label: "상품 목록", icon: "📦" },
  { view: "create", label: "상품 등록", icon: "➕" },
];

export function AdminSidebar({ activeView, onNavigate }: AdminSidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-violet">
          Goodz Admin
        </p>
        <h1 className="mt-1 text-lg font-bold text-white">운영 대시보드</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className={[
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-violet text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
              ].join(" ")}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        MVP mock · API :4000
      </div>
    </aside>
  );
}
