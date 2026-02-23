"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface PickupRequest {
  _id: string;
  name: string;
  phone: string;
  address: string;
  model: string;
  registrationNumber: string;
  preferredDate: string;
  preferredTime: string;
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

const statusColors: Record<string, { bg: string; dot: string }> = {
  pending: { bg: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-500" },
  confirmed: { bg: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  completed: { bg: "bg-green-50 text-green-700", dot: "bg-green-500" },
  cancelled: { bg: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

export default function PickupRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ─── Fetch ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const r = await fetch("/api/admin/pickup-requests", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (r.status === 401 || r.status === 403) {
      localStorage.clear();
      router.push("/admin/login");
      return;
    }
    const d = await r.json();
    if (d.success) setRequests(d.data);
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      router.push("/admin/login");
      return;
    }
    fetchAll().then(() => setLoading(false));
  }, [fetchAll, router]);

  // ─── Filtered ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [requests, statusFilter, search]);

  // ─── Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const confirmed = requests.filter((r) => r.status === "confirmed").length;
    const completed = requests.filter((r) => r.status === "completed").length;
    return { total: requests.length, pending, confirmed, completed };
  }, [requests]);

  // ─── Actions ────────────────────────────────────────────
  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/pickup-requests/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    fetchAll();
  }

  async function deleteRequest(id: string) {
    if (!confirm("Delete this pickup request?")) return;
    await fetch(`/api/admin/pickup-requests/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Pickup & Drop Requests</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage vehicle pickup and delivery requests
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <span className="text-2xl">🚚</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 uppercase tracking-wider font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.confirmed}</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 uppercase tracking-wider font-medium">Completed</p>
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
            placeholder="Search by name..."
            className="pl-9 pr-4 py-2 w-60 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Status:</span>
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={chip(statusFilter === s)}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {requests.length === 0 ? "No pickup requests yet." : "No requests match filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 text-left text-[11px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Registration</th>
                  <th className="px-5 py-3 font-medium">Address</th>
                  <th className="px-5 py-3 font-medium">Preferred Schedule</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => {
                  const colors = statusColors[r.status] || statusColors.pending;
                  return (
                    <tr key={r._id} className="text-sm hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">{r.name}</p>
                        <p className="text-[11px] text-gray-400">{r.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{r.model}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 uppercase">
                          {r.registrationNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs max-w-48 truncate">
                        {r.address}
                      </td>
                      <td className="px-5 py-3.5">
                        {r.preferredDate || r.preferredTime ? (
                          <div>
                            {r.preferredDate && <p className="text-xs text-gray-700">{r.preferredDate}</p>}
                            {r.preferredTime && <p className="text-[11px] text-gray-400">{r.preferredTime}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not specified</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${colors.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === "pending" && (
                            <button onClick={() => updateStatus(r._id, "confirmed")} className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition">
                              Confirm
                            </button>
                          )}
                          {r.status === "confirmed" && (
                            <button onClick={() => updateStatus(r._id, "completed")} className="px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-md transition">
                              Complete
                            </button>
                          )}
                          {(r.status === "pending" || r.status === "confirmed") && (
                            <button onClick={() => updateStatus(r._id, "cancelled")} className="px-2.5 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded-md transition">
                              Cancel
                            </button>
                          )}
                          <button onClick={() => deleteRequest(r._id)} className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition">
                            Delete
                          </button>
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
            Showing {filtered.length} of {requests.length} requests
          </div>
        )}
      </div>
    </div>
  );
}
