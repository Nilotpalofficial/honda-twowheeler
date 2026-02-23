"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface ServiceSchedule {
  _id: string;
  modelSlug: string;
  serviceName: string;
  kmRange: string;
  duration: string;
  description: string;
  createdAt: string;
}

interface ScheduleForm {
  modelSlug: string;
  serviceName: string;
  kmRange: string;
  duration: string;
  description: string;
}

const emptyForm: ScheduleForm = {
  modelSlug: "",
  serviceName: "",
  kmRange: "",
  duration: "",
  description: "",
};

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

const inp =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white";

export default function ServiceSchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const r = await fetch("/api/service-schedules");
    const d = await r.json();
    if (d.success) setSchedules(d.data);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      router.push("/admin/login");
      return;
    }
    fetchAll().then(() => setLoading(false));
  }, [fetchAll, router]);

  // ─── Filtered ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      if (
        search &&
        !s.modelSlug.toLowerCase().includes(search.toLowerCase()) &&
        !s.serviceName.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [schedules, search]);

  // ─── Actions ────────────────────────────────────────────
  function openCreate() {
    setForm(emptyForm);
    setFormErr("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr("");
    setSaving(true);

    const body = {
      modelSlug: form.modelSlug,
      serviceName: form.serviceName,
      kmRange: form.kmRange,
      duration: form.duration,
      description: form.description,
    };

    const r = await fetch("/api/service-schedules", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setSaving(false);
    if (!d.success) { setFormErr(d.error); return; }
    setShowForm(false);
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
          <h2 className="text-2xl font-bold text-gray-900">Service Schedules</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage maintenance schedules for vehicle models
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> Add Schedule
        </button>
      </div>

      {/* Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔧</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
              <p className="text-xs text-gray-400">Total Schedules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model or service name..."
            className="pl-9 pr-4 py-2 w-72 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {schedules.length === 0 ? "No service schedules yet." : "No schedules match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 text-left text-[11px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">KM Range</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s._id} className="text-sm hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                        {s.modelSlug}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-900">{s.serviceName}</td>
                    <td className="px-5 py-3.5 text-gray-600">{s.kmRange}</td>
                    <td className="px-5 py-3.5 text-gray-600">{s.duration}</td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate">{s.description || "—"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        disabled
                        className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition opacity-50 cursor-not-allowed"
                        title="Coming soon"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
            Showing {filtered.length} of {schedules.length} schedules
          </div>
        )}
      </div>

      {/* ═══ Modal ═══ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add New Schedule</h2>
                <p className="text-xs text-gray-400 mt-0.5">Create a maintenance schedule</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formErr && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{formErr}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Model Slug</label>
                <input type="text" required value={form.modelSlug} onChange={(e) => setForm({ ...form, modelSlug: e.target.value })} className={inp} placeholder="e.g. activa-6g" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Name</label>
                <input type="text" required value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} className={inp} placeholder="e.g. First Free Service" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">KM Range</label>
                <input type="text" required value={form.kmRange} onChange={(e) => setForm({ ...form, kmRange: e.target.value })} className={inp} placeholder="e.g. 1000-1500 km" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                <input type="text" required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inp} placeholder="e.g. 45 mins" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inp} placeholder="Optional description" />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={saving} className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50">
                  {saving ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
