import Link from "next/link";
import NavItems from "./NavItems";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-6">
       <div className="relative flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl font-black text-[#E60012]">H</span>
            <span className="text-lg font-bold tracking-widest text-gray-900">
              HONDA
            </span>
          </Link>

          {/* Center Nav + Mega Menu */}
          <NavItems />

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/find-dealer"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold tracking-wide text-gray-700 transition hover:border-[#E60012] hover:text-[#E60012]"
            >
              Find a Dealer
            </Link> 
            <Link
              href="/book-test-ride"
              className="rounded-full bg-[#E60012] px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-red-700"
            >
              Book a Test Ride
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
