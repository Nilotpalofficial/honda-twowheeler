"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  _id: string;
  name: string;
  slug: string;
  categorySlug: string;
  channelSlug: string;
  basePrice: { exShowroom: number };
  images: { thumbnail: string; gallery: string[] };
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export default function OverviewPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetch("/api/vehicles/admin", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setVehicles(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const active = vehicles.filter((v) => v.isActive && !v.deletedAt);
  const inactive = vehicles.filter((v) => !v.isActive && !v.deletedAt);
  const deleted = vehicles.filter((v) => v.deletedAt);
  const scooters = vehicles.filter((v) => v.categorySlug === "scooter" && !v.deletedAt);
  const motorcycles = vehicles.filter((v) => v.categorySlug === "motorcycle" && !v.deletedAt);
  const evs = vehicles.filter((v) => v.categorySlug === "ev" && !v.deletedAt);
  const recent = [...vehicles]
    .filter((v) => !v.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-400 mt-1">
          Welcome to Honda Dealer Admin Dashboard
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Total
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {vehicles.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
              🏍️
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Active
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {active.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-lg">
              ✅
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Inactive
              </p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {inactive.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-lg">
              ⏸️
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Deleted
              </p>
              <p className="text-3xl font-bold text-red-500 mt-1">
                {deleted.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-lg">
              🗑️
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown + Recent */}
      <div className="grid grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            By Category
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                  🛵
                </div>
                <span className="text-sm text-gray-700">Scooters</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {scooters.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-sm">
                  🏍️
                </div>
                <span className="text-sm text-gray-700">Motorcycles</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {motorcycles.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">
                  ⚡
                </div>
                <span className="text-sm text-gray-700">Electric</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {evs.length}
              </span>
            </div>
          </div>
        </div>

        {/* Recently Added */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Recently Added
            </h3>
            <Link
              href="/admin/dashboard/vehicles"
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              View all →
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No vehicles yet
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((v) => (
                <Link
                  key={v._id}
                  href={`/admin/dashboard/vehicles/${v._id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    {v.images?.thumbnail ? (
                      <img
                        src={v.images.thumbnail}
                        alt={v.name}
                        className="w-10 h-8 object-cover rounded border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-300 text-[10px]">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition">
                        {v.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {v.categorySlug} · {v.channelSlug}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      ₹{v.basePrice.exShowroom.toLocaleString("en-IN")}
                    </p>
                    {v.isActive ? (
                      <span className="text-[10px] text-green-600">Active</span>
                    ) : (
                      <span className="text-[10px] text-yellow-600">
                        Inactive
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
