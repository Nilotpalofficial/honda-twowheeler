"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Appointment {
  _id: string;
  name: string;
  phone: string;
  email: string;
  model: string;
  registrationNumber: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

const chip = (on: boolean) =>
  `px-3 py-1.5 text-xs font-medium rounded-full border transition cursor-pointer ${
    on
      ? "bg-red-600 text-white border-red-600"
      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
  }`;

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export default function ServiceAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Action menu
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // ─── Fetch ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const r = await fetch("/api/admin/service-appointments", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (r.status === 401 || r.status === 403) {
      localStorage.clear();
      router.push("/admin/login");
      return;
    }
    const d = await r.json();
    if (d.success) setAppointments(d.data);
  }, [router]);

  useEffect(() => {
    fetchAll().then(() => setLoading(false));
  }, [fetchAll]);

  // ─── Filtered ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [appointments, status, search]);

  // ─── Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "pending").length;
    const confirmed = appointments.filter((a) => a.status === "confirmed").length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    return { total, pending, confirmed, completed };
  }, [appointments]);

  // ─── Actions ────────────────────────────────────────────
  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/admin/service-appointments/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    setOpenMenu(null);
    fetchAll();
  }

  async function deleteAppointment(id: string) {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    await fetch(`/api/admin/service-appointments/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    setOpenMenu(null);
    fetchAll();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Appointments</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage customer service bookings
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <span className="text-2xl">📅</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.confirmed}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <span className="text-2xl">✔️</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name..."
            className="pl-9 pr-4 py-2 w-60 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Status:</span>
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={chip(status === s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No appointments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 text-left text-[11px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Registration</th>
                  <th className="px-5 py-3 font-medium">Date & Time</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => {
                  const sc = statusColors[a.status] || statusColors.pending;
                  return (
                    <tr key={a._id} className="text-sm hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">{a.name}</p>
                        <p className="text-[11px] text-gray-400">{a.phone}</p>
                        <p className="text-[11px] text-gray-400">{a.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{a.model}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 uppercase">
                          {a.registrationNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-gray-900">{a.date}</p>
                        <p className="text-[11px] text-gray-400">{a.time}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenu(openMenu === a._id ? null : a._id)}
                            className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition"
                          >
                            ⋮
                          </button>
                          {openMenu === a._id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                              {a.status !== "pending" && (
                                <button onClick={() => updateStatus(a._id, "pending")} className="w-full text-left px-3 py-2 text-xs text-yellow-600 hover:bg-yellow-50 transition">Mark Pending</button>
                              )}
                              {a.status !== "confirmed" && (
                                <button onClick={() => updateStatus(a._id, "confirmed")} className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 transition">Mark Confirmed</button>
                              )}
                              {a.status !== "completed" && (
                                <button onClick={() => updateStatus(a._id, "completed")} className="w-full text-left px-3 py-2 text-xs text-green-600 hover:bg-green-50 transition">Mark Completed</button>
                              )}
                              {a.status !== "cancelled" && (
                                <button onClick={() => updateStatus(a._id, "cancelled")} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition">Mark Cancelled</button>
                              )}
                              <div className="border-t border-gray-100 my-1" />
                              <button onClick={() => deleteAppointment(a._id)} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition">Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
            Showing {filtered.length} of {appointments.length} appointments
          </div>
        )}
      </div>
    </div>
  );
}
