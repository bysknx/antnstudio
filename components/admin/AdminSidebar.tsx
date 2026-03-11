 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  LineChart,
  Receipt,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";

const ADMIN_ASCII_COMPACT =
  " ░██   ADMIN\n" + " ░██   PANEL\n";

type AdminSidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile?: () => void;
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/finances", label: "Finances", icon: LineChart },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  collapsed,
  onToggleCollapsed,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname != null && pathname.startsWith(href);

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-[#222222] bg-[#111111] transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-[68px]" : "w-[280px]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-4 pb-3">
        <div className="overflow-hidden">
          {!collapsed && (
            <pre
              className="text-[10px] leading-[1.1] text-[var(--text-secondary)] font-mono"
              aria-hidden
            >
              {ADMIN_ASCII_COMPACT}
            </pre>
          )}
          {collapsed && (
            <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)] font-mono">
              antn
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="icon-btn"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[var(--text-secondary)]" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 pb-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onCloseMobile}
              className={`group flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              } gap-3 rounded-[8px] px-2.5 py-2.5 text-sm transition-colors duration-200 ease-in-out ${
                active
                  ? "bg-[#161616] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[#161616]"
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">
                <Icon className="h-5 w-5" />
              </span>
              {!collapsed && (
                <span className="truncate tracking-[-0.02em]">{label}</span>
              )}
              {active && !collapsed && (
                <span className="ml-auto h-4 w-[3px] rounded-full bg-[var(--text-primary)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

