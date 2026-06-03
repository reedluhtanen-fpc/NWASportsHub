"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AGE_GROUPS_BY_SPORT, CATEGORIES } from "@/lib/constants";
import type { Listing } from "@/lib/sheets";

function CityMultiSelect({
  cities,
  selected,
  onChange,
}: {
  cities: string[];
  selected: string[];
  onChange: (cities: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(city: string) {
    onChange(
      selected.includes(city) ? selected.filter((c) => c !== city) : [...selected, city]
    );
  }

  const label =
    selected.length === 0
      ? "All Cities"
      : selected.length === 1
      ? selected[0]
      : `${selected.length} cities`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#34a85a] text-left"
      >
        <span className={selected.length === 0 ? "text-gray-400" : "text-gray-800"}>{label}</span>
        <span className="text-gray-400 ml-2">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {cities.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">No cities available</div>
          )}
          {cities.map((city) => (
            <label
              key={city}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#e8f5ed] cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(city)}
                onChange={() => toggle(city)}
                className="accent-[#34a85a]"
              />
              {city}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();
  const sport = "Baseball";
  const [ageGroup, setAgeGroup] = useState(searchParams.get("age") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const ageGroups = AGE_GROUPS_BY_SPORT[sport];

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setListings(data);
        else setError("Could not load listings.");
      })
      .catch(() => setError("Could not load listings."))
      .finally(() => setLoading(false));
  }, []);

  // Derive sorted unique cities from listings for the selected sport
  const availableCities = Array.from(
    new Set(
      listings
        .filter((l) => !sport || l.sport === sport)
        .map((l) => l.city)
        .filter(Boolean)
    )
  ).sort();

  function clearFilters() {
    setAgeGroup("");
    setCategory("");
    setSelectedCities([]);
    setSearch("");
  }

  const filtered = listings.filter((l) => {
    if (sport && l.sport !== sport) return false;
    if (ageGroup && l.ageGroup !== ageGroup) return false;
    if (category && l.category !== category) return false;
    if (selectedCities.length > 0 && !selectedCities.includes(l.city)) return false;
    if (
      search &&
      !l.teamName.toLowerCase().includes(search.toLowerCase()) &&
      !l.organization.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  }).sort((a, b) => {
    const aHasTryout = !!(a.tryoutDate || a.tryoutDate2 || a.tryoutDate3);
    const bHasTryout = !!(b.tryoutDate || b.tryoutDate2 || b.tryoutDate3);
    if (aHasTryout && !bHasTryout) return -1;
    if (!aHasTryout && bHasTryout) return 1;
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">⚾</span>
        <h1 className="text-2xl font-black text-[#1a4d2e]">Baseball Teams &amp; Leagues</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a85a] col-span-2 sm:col-span-1"
          />
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a85a] bg-white"
          >
            <option value="">All Ages</option>
            {ageGroups.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a85a] bg-white"
          >
            <option value="">Rec & Competitive</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <CityMultiSelect
            cities={availableCities}
            selected={selectedCities}
            onChange={setSelectedCities}
          />
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span>{loading ? "Loading..." : `${filtered.length} listing${filtered.length !== 1 ? "s" : ""}`}</span>
          {selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedCities.map((c) => (
                <span
                  key={c}
                  className="bg-[#e8f5ed] text-[#1a4d2e] px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  {c}
                  <button onClick={() => setSelectedCities(selectedCities.filter((x) => x !== c))} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {error && <div className="text-center py-16 text-red-500">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">No listings found.</p>
          <p className="text-gray-300 text-sm">Try adjusting your filters or check back soon.</p>
        </div>
      )}
      <p className="text-xs text-gray-400 mb-3 italic">Click on any team to see full details, tryout info, and contact information.</p>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1a4d2e] text-white text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-semibold">Team</th>
              <th className="text-left px-4 py-3 font-semibold">Age</th>
              <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Level</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">City</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Tryout Date</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Tryout Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((listing, i) => (
              <tr
                key={listing.id}
                onClick={() => router.push(`/team/${listing.id}`)}
                className={`cursor-pointer hover:bg-[#e8f5ed] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1a4d2e]">{listing.teamName}</div>
                    {listing.organization && <div className="text-xs text-gray-400">{listing.organization}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[#e8f5ed] text-[#1a4d2e] text-xs font-semibold px-2 py-0.5 rounded-full">{listing.ageGroup}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                    <div>{listing.category}</div>
                    {listing.level && <div className="text-xs text-gray-400">{listing.level}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{listing.city}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{listing.tryoutDate || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{listing.tryoutTime || <span className="text-gray-300">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: "green" | "gray" }) {
  const styles = color === "green" ? "bg-[#e8f5ed] text-[#1a4d2e]" : "bg-gray-100 text-gray-600";
  return <span className={`${styles} text-xs font-medium px-2 py-0.5 rounded-full`}>{children}</span>;
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
