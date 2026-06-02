"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1a4d2e] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="NWA Sports Hub" className="h-10 w-10 rounded-full" />
          <span className="ml-2 text-[#6dcf90] font-black text-xl tracking-tight">NWA</span>
          <span className="font-semibold text-white text-xl tracking-tight ml-1">Sports Hub</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/browse"
            className="bg-[#34a85a] hover:bg-[#276845] text-white px-4 py-2 rounded-full transition-colors text-sm font-semibold"
          >
            Find Teams
          </Link>
          <Link
            href="/submit"
            className="bg-[#34a85a] hover:bg-[#276845] text-white px-4 py-2 rounded-full transition-colors text-sm font-semibold"
          >
            Add a Team
          </Link>
        </div>
      </div>
    </nav>
  );
}
