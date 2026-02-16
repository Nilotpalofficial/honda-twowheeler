"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  _id: string;
  name: string;
  slug: string;
  categorySlug: string;
  channelSlug: string;
  basePrice: { exShowroom: number };
  engine?: { displacement: string; type: string; power: string; torque: string };
  performance?: { mileage: string };
  electric?: {
    batteryCapacity: string;
    range: string;
    chargingTime: string;
    motorPower: string;
    chargerType: string;
  };
  images: { thumbnail: string; gallery: string[] };
  highlights: string[];
  isActive: boolean;
  deletedAt: string | null;
}

interface VehicleForm {
  name: string;
  categorySlug: string;
  channelSlug: string;
  exShowroom: string;
  displacement: string;
  engineType: string;
  power: string;
  torque: string;
  mileage: string;
  batteryCapacity: string;
  range: string;
  chargingTime: string;
  motorPower: string;
  chargerType: string;
  highlights: string;
}

const emptyForm: VehicleForm = {
  name: "",
  categorySlug: "scooter",
  channelSlug: "standard",
  exShowroom: "",
  displacement: "",
  engineType: "",
  power: "",
  torque: "",
  mileage: "",
  batteryCapacity: "",
  range: "",
  chargingTime: "",
  motorPower: "",
  chargerType: "",
  highlights: "",
};

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

const inp =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white";

const chip = (on: boolean) =>
  `px-3 py-1.5 text-xs font-medium rounded-full border transition cursor-pointer ${
    on
      ? "bg-red-600 text-white border-red-600"
      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
  }`;

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [cat, setCat] = useState("all");
  const [chan, setChan] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [thumb, setThumb] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const isEV = form.categorySlug === "ev";

  // ─── Upload ─────────────────────────────────────────────
  async function upload(file: File, folder: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const r = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });
    const d = await r.json();
    if (!d.success) { setFormErr(d.error); return null; }
    return d.url as string;
  }

  async function onThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const folder = form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "general";
    const url = await upload(f, folder);
    if (url) setThumb(url);
    setUploading(false);
  }

  async function onGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const folder = form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "general";
    for (const f of Array.from(files)) {
      const url = await upload(f, folder);
      if (url) setGallery((p) => [...p, url]);
    }
    setUploading(false);
  }

  // ─── Fetch ──────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const r = await fetch("/api/vehicles/admin", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (r.status === 401 || r.status === 403) {
      localStorage.clear();
      router.push("/admin/login");
      return;
    }
    const d = await r.json();
    if (d.success) setVehicles(d.data);
  }, [router]);

  useEffect(() => {
    fetchAll().then(() => setLoading(false));
  }, [fetchAll]);

  // ─── Filtered ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (cat !== "all" && v.categorySlug !== cat) return false;
      if (chan !== "all" && v.channelSlug !== chan) return false;
      if (status === "active" && (!v.isActive || v.deletedAt)) return false;
      if (status === "inactive" && (v.isActive || v.deletedAt)) return false;
      if (status === "deleted" && !v.deletedAt) return false;
      if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [vehicles, cat, chan, status, search]);

  // ─── Actions ────────────────────────────────────────────
  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setThumb("");
    setGallery([]);
    setFormErr("");
    setShowForm(true);
  }

  function openEdit(v: Vehicle) {
    setEditId(v._id);
    setForm({
      name: v.name,
      categorySlug: v.categorySlug,
      channelSlug: v.channelSlug,
      exShowroom: String(v.basePrice.exShowroom),
      displacement: v.engine?.displacement || "",
      engineType: v.engine?.type || "",
      power: v.engine?.power || "",
      torque: v.engine?.torque || "",
      mileage: v.performance?.mileage || "",
      batteryCapacity: v.electric?.batteryCapacity || "",
      range: v.electric?.range || "",
      chargingTime: v.electric?.chargingTime || "",
      motorPower: v.electric?.motorPower || "",
      chargerType: v.electric?.chargerType || "",
      highlights: v.highlights.join(", "),
    });
    setThumb(v.images?.thumbnail || "");
    setGallery(v.images?.gallery || []);
    setFormErr("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr("");
    setSaving(true);

    const body: Record<string, any> = {
      name: form.name,
      categorySlug: form.categorySlug,
      channelSlug: form.channelSlug,
      basePrice: { exShowroom: Number(form.exShowroom) },
      images: { thumbnail: thumb, gallery },
      highlights: form.highlights.split(",").map((h) => h.trim()).filter(Boolean),
    };
    if (isEV) {
      body.electric = { batteryCapacity: form.batteryCapacity, range: form.range, chargingTime: form.chargingTime, motorPower: form.motorPower, chargerType: form.chargerType };
    } else {
      body.engine = { displacement: form.displacement, type: form.engineType, power: form.power, torque: form.torque };
      body.performance = { mileage: form.mileage };
    }

    const r = await fetch(editId ? `/api/vehicles/${editId}` : "/api/vehicles", {
      method: editId ? "PATCH" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setSaving(false);
    if (!d.success) { setFormErr(d.error); return; }
    setShowForm(false);
    fetchAll();
  }

  async function toggleStatus(v: Vehicle) {
    await fetch(`/api/vehicles/${v._id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ isActive: !v.isActive }),
    });
    fetchAll();
  }

  async function softDelete(v: Vehicle) {
    if (!confirm(`Soft-delete "${v.name}"?`)) return;
    await fetch(`/api/vehicles/${v._id}`, { method: "DELETE", headers: authHeaders() });
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
          <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage all Honda two-wheelers
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles..."
            className="pl-9 pr-4 py-2 w-60 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Category:</span>
          {["all", "scooter", "motorcycle", "ev"].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={chip(cat === c)}>
              {c === "all" ? "All" : c === "ev" ? "⚡ EV" : c === "motorcycle" ? "🏍️ Motorcycle" : "🛵 Scooter"}
            </button>
          ))}
          <span className="text-gray-200 mx-1">|</span>
          <span className="text-xs text-gray-400">Channel:</span>
          {["all", "standard", "bigwing"].map((c) => (
            <button key={c} onClick={() => setChan(c)} className={chip(chan === c)}>
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
          <span className="text-gray-200 mx-1">|</span>
          <span className="text-xs text-gray-400">Status:</span>
          {["all", "active", "inactive", "deleted"].map((s) => (
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
            {vehicles.length === 0 ? "No vehicles yet." : "No vehicles match filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 text-left text-[11px] text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Channel</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Key Spec</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((v) => (
                  <tr key={v._id} className="text-sm hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/dashboard/vehicles/${v._id}`} className="flex items-center gap-3 group">
                        {v.images?.thumbnail ? (
                          <img src={v.images.thumbnail} alt={v.name} className="w-14 h-10 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-14 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 text-[10px]">N/A</div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-red-600 transition">{v.name}</p>
                          <p className="text-[11px] text-gray-400">/{v.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${v.categorySlug === "ev" ? "bg-blue-50 text-blue-700" : v.categorySlug === "motorcycle" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                        {v.categorySlug === "ev" ? "⚡ EV" : v.categorySlug === "motorcycle" ? "🏍️ Bike" : "🛵 Scooter"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 capitalize">{v.channelSlug}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">₹{v.basePrice.exShowroom.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {v.categorySlug === "ev"
                        ? [v.electric?.range, v.electric?.batteryCapacity].filter(Boolean).join(" · ")
                        : [v.engine?.displacement, v.performance?.mileage].filter(Boolean).join(" · ")}
                    </td>
                    <td className="px-5 py-3.5">
                      {v.deletedAt ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Deleted</span>
                      ) : v.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!v.deletedAt && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(v)} className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition">Edit</button>
                          <button onClick={() => toggleStatus(v)} className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition ${v.isActive ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"}`}>
                            {v.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => softDelete(v)} className="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
            Showing {filtered.length} of {vehicles.length} vehicles
          </div>
        )}
      </div>

      {/* ═══ Modal ═══ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{editId ? "Edit Vehicle" : "Add New Vehicle"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{editId ? "Update vehicle details" : "Add to catalogue"}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formErr && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{formErr}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} placeholder="e.g. Activa 6G" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value })} className={inp}>
                    <option value="scooter">🛵 Scooter</option>
                    <option value="motorcycle">🏍️ Motorcycle</option>
                    <option value="ev">⚡ EV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Channel</label>
                  <select value={form.channelSlug} onChange={(e) => setForm({ ...form, channelSlug: e.target.value })} className={inp}>
                    <option value="standard">Standard</option>
                    <option value="bigwing">BigWing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ex-Showroom Price (₹)</label>
                <input type="number" required value={form.exShowroom} onChange={(e) => setForm({ ...form, exShowroom: e.target.value })} className={inp} placeholder="e.g. 76988" />
              </div>

              {/* Images */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50/50">
                <p className="text-sm font-medium text-gray-700">📷 Images</p>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Thumbnail</p>
                  {thumb ? (
                    <div className="relative inline-block">
                      <img src={thumb} alt="Thumb" className="w-36 h-24 object-cover rounded-lg border" />
                      <button type="button" onClick={() => setThumb("")} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-36 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition">
                      <input type="file" accept="image/*" onChange={onThumbUpload} disabled={uploading} className="hidden" />
                      <span className="text-xs text-gray-400">+ Upload</span>
                    </label>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Gallery</p>
                  <div className="flex flex-wrap gap-2">
                    {gallery.map((url, i) => (
                      <div key={i} className="relative inline-block">
                        <img src={url} alt="" className="w-24 h-18 object-cover rounded-lg border" />
                        <button type="button" onClick={() => setGallery((p) => p.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                      </div>
                    ))}
                    <label className="flex items-center justify-center w-24 min-h-[4.5rem] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition">
                      <input type="file" accept="image/*" multiple onChange={onGalleryUpload} disabled={uploading} className="hidden" />
                      <span className="text-xs text-gray-400">+ Add</span>
                    </label>
                  </div>
                </div>
                {uploading && <div className="flex items-center gap-2 text-sm text-blue-600"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />Uploading...</div>}
              </div>

              {/* ICE */}
              {!isEV && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                  <p className="text-sm font-medium text-gray-700">🔧 Engine & Performance</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.displacement} onChange={(e) => setForm({ ...form, displacement: e.target.value })} className={inp} placeholder="Displacement" />
                    <input value={form.engineType} onChange={(e) => setForm({ ...form, engineType: e.target.value })} className={inp} placeholder="Engine Type" />
                    <input value={form.power} onChange={(e) => setForm({ ...form, power: e.target.value })} className={inp} placeholder="Power" />
                    <input value={form.torque} onChange={(e) => setForm({ ...form, torque: e.target.value })} className={inp} placeholder="Torque" />
                  </div>
                  <input value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} className={inp} placeholder="Mileage" />
                </div>
              )}

              {/* EV */}
              {isEV && (
                <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50/30">
                  <p className="text-sm font-medium text-gray-700">⚡ Electric Specs</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.batteryCapacity} onChange={(e) => setForm({ ...form, batteryCapacity: e.target.value })} className={inp} placeholder="Battery Capacity" />
                    <input value={form.range} onChange={(e) => setForm({ ...form, range: e.target.value })} className={inp} placeholder="Range" />
                    <input value={form.chargingTime} onChange={(e) => setForm({ ...form, chargingTime: e.target.value })} className={inp} placeholder="Charging Time" />
                    <input value={form.motorPower} onChange={(e) => setForm({ ...form, motorPower: e.target.value })} className={inp} placeholder="Motor Power" />
                  </div>
                  <input value={form.chargerType} onChange={(e) => setForm({ ...form, chargerType: e.target.value })} className={inp} placeholder="Charger Type" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Highlights</label>
                <textarea value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} rows={2} className={inp} placeholder="Comma-separated highlights" />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
