"use client";

import Link from "next/link";
import { SPORT_IMAGES } from "@/lib/constants";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Full-page hero with everything overlaid */}
      <div className="relative min-h-screen overflow-hidden">
        <img
          src={SPORT_IMAGES.Baseball}
          alt="Youth baseball"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2b1a]/60 via-[#0d2b1a]/70 to-[#0d2b1a]/90" />

        <div className="relative z-10 flex flex-col items-center justify-start pt-20 px-4 pb-16">
          {/* Badge */}
          <div className="inline-block bg-[#34a85a]/20 border border-[#6dcf90]/40 text-[#6dcf90] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Northwest Arkansas
          </div>

          {/* Headline */}
          <h1 className="text-white text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-lg text-center">
            Navigating the NWA<br />youth baseball scene.
          </h1>

          {/* Tagline */}
          <p className="text-white/80 text-lg mb-12 text-center max-w-xl">
            Get info about local teams, leagues, tryouts, and more — all in one place.
          </p>

          {/* Two action panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 gap-4">
              <span className="text-4xl">📋</span>
              <h3 className="font-bold text-white text-xl">Get the Details</h3>
              <p className="text-white/70 text-sm leading-relaxed flex-1">
                See tryout dates and locations, registration information, team website, and contact info.
              </p>
              <Link
                href="/browse"
                className="bg-[#34a85a] hover:bg-[#276845] text-white font-bold px-8 py-3 rounded-full transition-colors shadow w-full text-center"
              >
                Find Teams
              </Link>
            </div>
            <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 gap-4">
              <span className="text-4xl">📣</span>
              <h3 className="font-bold text-white text-xl">Add or Update Your Team</h3>
              <p className="text-white/70 text-sm leading-relaxed flex-1">
                Coaches, admins, and team managers can submit their team to be listed for free. Already listed? Use the same form to send us corrections or updated information.
              </p>
              <Link
                href="/submit"
                className="bg-[#34a85a] hover:bg-[#276845] text-white font-bold px-8 py-3 rounded-full transition-colors shadow w-full text-center"
              >
                Add a Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
