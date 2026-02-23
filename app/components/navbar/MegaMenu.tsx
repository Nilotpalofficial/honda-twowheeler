"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  slug: string;
  categorySlug: string;
  basePrice: { exShowroom: number; currency: string };
  images: { thumbnail: string; gallery: string[] };
}

const CATEGORIES = [
  { key: "ev", label: "EV", href: "/ev" },
  { key: "motorcycle", label: "Motorcycle", href: "/motorcycles" },
  { key: "scooter", label: "Scooters", href: "/scooters" },
] as const;

const MegaMenu = ({ isOpen }: { isOpen: boolean }) => {
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].key);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const cacheRef = useRef<Record<string, Product[]>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (cacheRef.current[activeCategory]) {
      setProducts((prev) => ({ ...prev, [activeCategory]: cacheRef.current[activeCategory] }));
      return;
    }

    setLoading((prev) => ({ ...prev, [activeCategory]: true }));

    fetch(`/api/products?category=${activeCategory}`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.success ? (data.data as Product[]) : [];
        cacheRef.current[activeCategory] = items;
        setProducts((prev) => ({ ...prev, [activeCategory]: items }));
      })
      .catch(() => {
        setProducts((prev) => ({ ...prev, [activeCategory]: [] }));
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, [activeCategory]: false }));
      });
  }, [isOpen, activeCategory]);

  if (!isOpen) return null;

  const currentProducts = products[activeCategory] ?? [];
  const isLoading = loading[activeCategory] ?? false;
  const activeMeta = CATEGORIES.find((c) => c.key === activeCategory)!;

  return (
    <div className="absolute left-[calc(-50vw+50%)] top-full z-50 w-screen border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl px-6">
        {/* Left sidebar — category list */}
        <div className="w-64 shrink-0 border-r border-gray-200 py-6 pr-6 pl-6">
          <ul className="space-y-1">
            {CATEGORIES.map((cat) => (
              <li key={cat.key}>
                <button
                  onMouseEnter={() => setActiveCategory(cat.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-semibold transition ${
                    activeCategory === cat.key
                      ? "text-[#E60012]"
                      : "text-gray-800 hover:text-[#E60012]"
                  }`}
                >
                  {cat.label}
                  <svg
                    className={`h-4 w-4 transition ${
                      activeCategory === cat.key ? "text-[#E60012]" : "text-gray-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}

            {/* Static links */}
            <li className="border-t border-gray-100 pt-2 mt-2">
              <Link
                href="/accessories"
                onMouseEnter={() => setActiveCategory("")}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-semibold text-gray-800 transition hover:text-[#E60012]"
              >
                Accessories
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>

        {/* Right side — product grid with images */}
        <div className="flex-1 py-6 px-8">
          {isLoading && (
            <div className="grid grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-28 w-36 animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && activeCategory && currentProducts.length === 0 && (
            <p className="py-8 text-sm text-gray-400">No products available</p>
          )}

          {!isLoading && currentProducts.length > 0 && (
            <>
              <div className="grid grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    className="group flex flex-col items-center gap-2 rounded-lg p-3 transition hover:bg-gray-50"
                  >
                    {product.images.thumbnail ? (
                      <Image
                        src={product.images.thumbnail}
                        alt={product.name}
                        width={160}
                        height={112}
                        className="h-28 w-40 object-contain"
                      />
                    ) : (
                      <div className="flex h-28 w-40 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        No image
                      </div>
                    )}
                    <span className="text-center text-sm font-medium text-gray-800 transition group-hover:text-[#E60012]">
                      {product.name}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href={activeMeta.href}
                  className="inline-block rounded bg-[#E60012] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  View All
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default MegaMenu;
