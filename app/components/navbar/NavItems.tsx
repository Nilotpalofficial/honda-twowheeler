"use client";

import { useState } from "react";
import Link from "next/link";
import MegaMenu from "./MegaMenu";

const NavItems = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        href="/products"
        className={`inline-block border-b-2 py-5 font-sans text-sm font-medium uppercase tracking-wide transition ${
          isOpen
            ? "border-[#E60012] text-[#E60012]"
            : "border-transparent text-gray-700 hover:text-[#E60012]"
        }`}
      >
        Products
      </Link>
      <MegaMenu isOpen={isOpen} />
    </div>
  );
};

export default NavItems;
