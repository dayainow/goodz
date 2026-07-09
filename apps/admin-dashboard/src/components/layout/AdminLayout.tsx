import type { ReactNode } from "react";
import type { AdminView } from "./AdminSidebar";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({
  activeView,
  onNavigate,
  title,
  description,
  actions,
  children,
}: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen min-w-[1280px] bg-slate-100">
      <AdminSidebar activeView={activeView} onNavigate={onNavigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              )}
            </div>
            {actions}
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
