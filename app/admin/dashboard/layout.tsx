"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: "📊" },
  { href: "/admin/dashboard/vehicles", label: "Vehicles", icon: "🏍️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setEmail(localStorage.getItem("admin_email") || "");
  }, [router]);

  function handleLogout() {
    localStorage.clear();
    router.push("/admin/login");
  }

  function isActive(href: string) {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">H</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                Honda Admin
              </h1>
              <p className="text-[10px] text-gray-400">Dealer Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition ${
                isActive(item.href)
                  ? "bg-red-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-red-600 text-xs font-bold">
                  {email.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-600 transition shrink-0 ml-2"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 overflow-auto">{children}</main>
    </div>
  );
}
