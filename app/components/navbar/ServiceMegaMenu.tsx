"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Service {
  _id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  thumbnail: string;
}

const typeIcons: Record<string, string> = {
  appointment: "📅",
  "pickup-drop": "🚚",
  schedule: "🔧",
};

const typeLabels: Record<string, string> = {
  appointment: "Book Appointment",
  "pickup-drop": "Pickup & Drop",
  schedule: "Service Schedule",
};

const ServiceMegaMenu = ({ isOpen }: { isOpen: boolean }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);

    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute left-[calc(-50vw+50%)] top-full z-50 w-screen border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading && (
          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <p className="py-4 text-sm text-gray-400">No services available</p>
        )}

        {!loading && services.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-gray-100 p-5 transition hover:border-[#E60012]/20 hover:bg-red-50/30"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl transition group-hover:bg-[#E60012]/10">
                  {typeIcons[service.type] ?? "🔧"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 transition group-hover:text-[#E60012]">
                    {service.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {service.description || typeLabels[service.type] || "Learn more"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-gray-100 pt-4">
          <Link
            href="/services"
            className="inline-block rounded bg-[#E60012] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            View All Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceMegaMenu;
