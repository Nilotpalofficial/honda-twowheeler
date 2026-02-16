"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Vehicle {
  _id: string;
  name: string;
  slug: string;
  brandSlug: string;
  categorySlug: string;
  channelSlug: string;
  basePrice: { exShowroom: number; currency: string };
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
  createdAt: string;
  updatedAt: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-gray-900 font-medium text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");

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
        if (d.success) {
          const found = d.data.find((v: Vehicle) => v._id === params.id);
          if (found) {
            setVehicle(found);
            setSelectedImage(found.images?.thumbnail || "");
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Vehicle not found.</p>
        <Link
          href="/admin/dashboard/vehicles"
          className="text-red-600 text-sm mt-2 inline-block"
        >
          ← Back to vehicles
        </Link>
      </div>
    );
  }

  const allImages = [
    vehicle.images?.thumbnail,
    ...(vehicle.images?.gallery || []),
  ].filter(Boolean);

  const isEV = vehicle.categorySlug === "ev";

  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link
          href="/admin/dashboard/vehicles"
          className="text-gray-400 hover:text-red-600 transition"
        >
          Vehicles
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">{vehicle.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{vehicle.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                isEV
                  ? "bg-blue-50 text-blue-700"
                  : vehicle.categorySlug === "motorcycle"
                    ? "bg-purple-50 text-purple-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {isEV
                ? "⚡ EV"
                : vehicle.categorySlug === "motorcycle"
                  ? "🏍️ Motorcycle"
                  : "🛵 Scooter"}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium capitalize">
              {vehicle.channelSlug}
            </span>
            {vehicle.deletedAt ? (
              <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Deleted
              </span>
            ) : vehicle.isActive ? (
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Inactive
              </span>
            )}
          </div>
        </div>
        <Link
          href="/admin/dashboard/vehicles"
          className="text-sm text-gray-400 hover:text-gray-600 transition"
        >
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* ═══ Left Column — Images ═══ */}
        <div className="col-span-3 space-y-4">
          {/* Main Image */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={vehicle.name}
                className="w-full h-80 object-contain bg-gray-50 p-4"
              />
            ) : (
              <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
                No image uploaded
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(url)}
                  className={`shrink-0 w-20 h-16 rounded-lg border-2 overflow-hidden transition ${
                    selectedImage === url
                      ? "border-red-500"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Highlights */}
          {vehicle.highlights.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                ✨ Highlights
              </h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-full font-medium"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ Right Column — Details Cards ═══ */}
        <div className="col-span-2 space-y-4">
          {/* Pricing Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              💰 Pricing
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              ₹{vehicle.basePrice.exShowroom.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Ex-Showroom · {vehicle.basePrice.currency}
            </p>
          </div>

          {/* Engine Card (ICE only) */}
          {!isEV && vehicle.engine && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                🔧 Engine
              </h3>
              <InfoRow
                label="Displacement"
                value={vehicle.engine.displacement}
              />
              <InfoRow label="Type" value={vehicle.engine.type} />
              <InfoRow label="Power" value={vehicle.engine.power} />
              <InfoRow label="Torque" value={vehicle.engine.torque} />
            </div>
          )}

          {/* Performance Card (ICE only) */}
          {!isEV && vehicle.performance?.mileage && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                ⛽ Performance
              </h3>
              <InfoRow label="Mileage" value={vehicle.performance.mileage} />
            </div>
          )}

          {/* Electric Card (EV only) */}
          {isEV && vehicle.electric && (
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5 bg-blue-50/20">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                ⚡ Electric Specs
              </h3>
              <InfoRow
                label="Battery"
                value={vehicle.electric.batteryCapacity}
              />
              <InfoRow label="Range" value={vehicle.electric.range} />
              <InfoRow
                label="Charging"
                value={vehicle.electric.chargingTime}
              />
              <InfoRow
                label="Motor Power"
                value={vehicle.electric.motorPower}
              />
              <InfoRow
                label="Charger"
                value={vehicle.electric.chargerType}
              />
            </div>
          )}

          {/* Meta Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              📋 Details
            </h3>
            <InfoRow label="Slug" value={`/${vehicle.slug}`} />
            <InfoRow label="Brand" value={vehicle.brandSlug.toUpperCase()} />
            <InfoRow
              label="Category"
              value={vehicle.categorySlug.toUpperCase()}
            />
            <InfoRow
              label="Channel"
              value={vehicle.channelSlug.toUpperCase()}
            />
            <InfoRow
              label="Images"
              value={`${allImages.length} uploaded`}
            />
            <InfoRow
              label="Created"
              value={new Date(vehicle.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
            <InfoRow
              label="Updated"
              value={new Date(vehicle.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
