"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  slug: string;
  brandSlug: string;
  categorySlug: "scooter" | "motorcycle" | "ev";
  channelSlug: string;
  basePrice: { exShowroom: number; currency: string };
  engine?: {
    displacement: string;
    type: string;
    power: string;
    torque: string;
  };
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
}

const formatPrice = (price: number): string => {
  return "₹" + price.toLocaleString("en-IN");
};

const categoryLabel: Record<string, string> = {
  scooter: "Scooter",
  motorcycle: "Motorcycle",
  ev: "Electric Vehicle",
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="mt-2 text-gray-500">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-[#E60012] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const isEV = product.categorySlug === "ev";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#E60012]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Hero: Image + Info */}
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-8">
          {product.images.thumbnail ? (
            <Image
              src={product.images.thumbnail}
              alt={product.name}
              width={500}
              height={350}
              className="h-auto max-h-80 w-auto object-contain"
              priority
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-600">
            {categoryLabel[product.categorySlug] ?? product.categorySlug}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-bold text-[#E60012]">
            {formatPrice(product.basePrice.exShowroom)}
            <span className="ml-2 text-sm font-normal text-gray-500">
              Ex-showroom
            </span>
          </p>

          {/* Highlights */}
          {product.highlights.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Highlights
              </h3>
              <ul className="mt-3 space-y-2">
                {product.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E60012]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mt-8 flex gap-3">
            <Link
              href="/book-test-ride"
              className="rounded-full bg-[#E60012] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Book a Test Ride
            </Link>
            <Link
              href="/find-dealer"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#E60012] hover:text-[#E60012]"
            >
              Find a Dealer
            </Link>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-gray-900">Specifications</h2>
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-gray-100">
              {isEV && product.electric && (
                <>
                  <SpecRow label="Motor Power" value={product.electric.motorPower} />
                  <SpecRow label="Battery Capacity" value={product.electric.batteryCapacity} />
                  <SpecRow label="Range" value={product.electric.range} />
                  <SpecRow label="Charging Time" value={product.electric.chargingTime} />
                  <SpecRow label="Charger Type" value={product.electric.chargerType} />
                </>
              )}
              {!isEV && product.engine && (
                <>
                  <SpecRow label="Engine Type" value={product.engine.type} />
                  <SpecRow label="Displacement" value={product.engine.displacement} />
                  <SpecRow label="Power" value={product.engine.power} />
                  <SpecRow label="Torque" value={product.engine.torque} />
                </>
              )}
              {!isEV && product.performance && (
                <SpecRow label="Mileage" value={product.performance.mileage} />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gallery */}
      {product.images.gallery.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {product.images.gallery.map((src, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl bg-gray-50"
              >
                <Image
                  src={src}
                  alt={`${product.name} - ${i + 1}`}
                  width={400}
                  height={280}
                  className="h-48 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const SpecRow = ({ label, value }: { label: string; value: string }) => {
  if (!value) return null;
  return (
    <tr>
      <td className="bg-gray-50 px-6 py-3 font-medium text-gray-600">{label}</td>
      <td className="px-6 py-3 text-gray-900">{value}</td>
    </tr>
  );
};
