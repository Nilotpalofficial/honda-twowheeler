"use client";

import { useState } from "react";
import Link from "next/link";
import MegaMenu from "./MegaMenu";
import ServiceMegaMenu from "./ServiceMegaMenu";

const NavItems = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const linkClass = (key: string) =>
    `inline-block border-b-2 py-5 font-sans text-sm font-medium uppercase tracking-wide transition ${
      activeMenu === key
        ? "border-[#E60012] text-[#E60012]"
        : "border-transparent text-gray-700 hover:text-[#E60012]"
    }`;

  return (
    <div className="flex items-center gap-8">
      {/* Products */}
      <div
        className="relative"
        onMouseEnter={() => setActiveMenu("products")}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <Link href="/products" className={linkClass("products")}>
          Products
        </Link>
        <MegaMenu isOpen={activeMenu === "products"} />
      </div>

      {/* Services */}
      <div
        className="relative"
        onMouseEnter={() => setActiveMenu("services")}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <Link href="/services" className={linkClass("services")}>
          Services
        </Link>
        <ServiceMegaMenu isOpen={activeMenu === "services"} />
      </div>
    </div>
  );
};

export default NavItems;
