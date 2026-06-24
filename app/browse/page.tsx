"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AGE_GROUPS_BY_SPORT, CATEGORIES } from "@/lib/constants";
import type { Listing } from "@/lib/sheets";
import AgeCalculator from "@/components/AgeCalculator";

// ---------------------------------------------------------------------------
// CityMultiSelect
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Calendar helpers
// ---------------------------------------------------------------------------

// Infer the most appropriate year for a month/day — current year unless
// the date is more than 60 days in the past, in which case use next year.
function inferYear(month: number, day: number, now: Date): number {
  const yr = now.getFullYear();
  const candidate = new Date(yr, month - 1, day);
  return candidate.getTime() < now.getTime() - 60 * 24 * 60 * 60 * 1000
    ? yr + 1
    : yr;
}

// Convert a Date to a local YYYY-MM-DD string (avoids UTC offset shifting the day).
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Parse a free-text date string from the sheet into a YYYY-MM-DD key.
// Handles: "7/7", "7/7/26", "7/7/2026", "July 7", "July 7 2026", ISO strings.
// Returns null if unparseable.
function parseDateKey(raw: string): string | null {
  if (!raw) return null;
  const str = raw.trim();
  if (!str) return null;
  const now = new Date();

  // M/D, M/D/YY, or M/D/YYYY
  const mdMatch = str.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (mdMatch) {
    const mo = parseInt(mdMatch[1], 10);
    const dy = parseInt(mdMatch[2], 10);
    let yr: number;
    if (mdMatch[3]) {
      yr = mdMatch[3].length === 2 ? 2000 + parseInt(mdMatch[3], 10) : parseInt(mdMatch[3], 10);
    } else {
      yr = inferYear(mo, dy, now);
    }
    return toDateKey(new Date(yr, mo - 1, dy));
  }

  // ISO or fully-specified strings ("July 7, 2026", "2026-07-07", etc.)
  const direct = new Date(str);
  if (!isNaN(direct.getTime()) && /\b\d{4}\b/.test(str)) {
    // Has explicit year — trust it but fix timezone offset
    return toDateKey(new Date(direct.getTime() + direct.getTimezoneOffset() * 60000));
  }

  // Month-name without year: "July 7", "Jul 7"
  const withCurrentYear = new Date(`${str} ${now.getFullYear()}`);
  if (!isNaN(withCurrentYear.getTime())) {
    const yr =
      withCurrentYear.getTime() < now.getTime() - 60 * 24 * 60 * 60 * 1000
        ? now.getFullYear() + 1
        : now.getFullYear();
    return toDateKey(new Date(`${str} ${yr}`));
  }

  return null;
}

interface TryoutEntry {
  listing: Listing;
  tryoutDate: string;
  tryoutTime: string;
  tryoutLocation: string;
  tryoutAddress: string;
}

// Build a map of dateKey -> TryoutEntry[] from the filtered listings
function buildTryoutMap(listings: Listing[]): Map<string, TryoutEntry[]> {
  const map = new Map<string, TryoutEntry[]>();

  function add(listing: Listing, dateRaw: string, time: string, loc: string, addr: string) {
    const key = parseDateKey(dateRaw);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({ listing, tryoutDate: dateRaw, tryoutTime: time, tryoutLocation: loc, tryoutAddress: addr });
  }

  for (const l of listings) {
    add(l, l.tryoutDate, l.tryoutTime, l.tryoutLocation, l.tryoutAddress);
    add(l, l.tryoutDate2, l.tryoutTime2, l.tryoutLocation2, l.tryoutAddress2);
    add(l, l.tryoutDate3, l.tryoutTime3, l.tryoutLocation3, l.tryoutAddress3);
  }

  return map;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ---------------------------------------------------------------------------
// CalendarView
// ---------------------------------------------------------------------------
function CalendarView({
  listings,
  router,
}: {
  listings: Listing[];
  router: ReturnType<typeof useRouter>;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const tryoutMap = buildTryoutMap(listings);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Build grid: days in the month padded to start on Sunday
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = parseDateKey(today.toISOString().slice(0, 10));

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedEntries = selectedKey ? (tryoutMap.get(selectedKey) ?? []) : [];

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-[#e8f5ed] text-[#1a4d2e] font-bold transition-colors"
        >
          ‹ Prev
        </button>
        <h2 className="text-lg font-black text-[#1a4d2e]">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-[#e8f5ed] text-[#1a4d2e] font-bold transition-colors"
        >
          Next ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 bg-[#1a4d2e]">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-white text-xs font-semibold py-2 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-20 bg-gray-50/50" />;
            }
            const mStr = String(month + 1).padStart(2, "0");
            const dStr = String(day).padStart(2, "0");
            const key = `${year}-${mStr}-${dStr}`;
            const entries = tryoutMap.get(key) ?? [];
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;

            return (
              <div
                key={key}
                onClick={() => setSelectedKey(isSelected ? null : key)}
                className={`h-20 p-1.5 flex flex-col cursor-pointer transition-colors
                  ${isSelected ? "bg-[#e8f5ed] ring-2 ring-inset ring-[#34a85a]" : "hover:bg-gray-50"}
                  ${entries.length > 0 ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`text-xs font-semibold self-start mb-1 w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? "bg-[#1a4d2e] text-white" : "text-gray-600"}`}
                >
                  {day}
                </span>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {entries.slice(0, 3).map((e, idx) => (
                    <div
                      key={idx}
                      className="text-[10px] leading-tight bg-[#1a4d2e] text-white rounded px-1 py-0.5 truncate"
                    >
                      {e.listing.teamName}
                    </div>
                  ))}
                  {entries.length > 3 && (
                    <div className="text-[10px] text-gray-400">+{entries.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected-day detail panel */}
      {selectedKey && selectedEntries.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-[#1a4d2e] text-sm mb-3">
            Tryouts on{" "}
            {new Date(selectedKey + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </h3>
          <div className="flex flex-col gap-3">
            {selectedEntries.map((e, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/team/${e.listing.id}`)}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-[#e8f5ed] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#1a4d2e] text-sm truncate">{e.listing.teamName}</div>
                  {e.listing.organization && (
                    <div className="text-xs text-gray-400 truncate">{e.listing.organization}</div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="bg-[#e8f5ed] text-[#1a4d2e] text-xs font-semibold px-2 py-0.5 rounded-full">
                      {e.listing.ageGroup}
                    </span>
                    {e.listing.city && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {e.listing.city}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {e.tryoutTime && (
                    <div className="text-xs font-semibold text-[#1a4d2e]">{e.tryoutTime}</div>
                  )}
                  {e.tryoutLocation && (
                    <div className="text-xs text-gray-500 max-w-[140px] text-right">{e.tryoutLocation}</div>
                  )}
                  <div className="text-xs text-[#34a85a] mt-1">View details →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedKey && selectedEntries.length === 0 && (
        <div className="mt-4 text-center py-6 text-gray-400 text-sm">
          No tryouts scheduled for this date.
        </div>
      )}

      {tryoutMap.size === 0 && (
        <div className="mt-4 text-center py-6 text-gray-400 text-sm">
          No tryout dates found for the current filters. Try clearing filters or check back as teams are added.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BrowseContent
// ---------------------------------------------------------------------------
function BrowseContent() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

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

      <div className="mb-6">
        <AgeCalculator />
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
            <option value="">Rec &amp; Competitive</option>
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

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors
            ${viewMode === "list"
              ? "bg-[#1a4d2e] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          List View
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors
            ${viewMode === "calendar"
              ? "bg-[#1a4d2e] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar View
        </button>
      </div>

      {/* Results */}
      {error && <div className="text-center py-16 text-red-500">{error}</div>}

      {viewMode === "list" && (
        <>
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
        </>
      )}

      {viewMode === "calendar" && !loading && !error && (
        <>
          <p className="text-xs text-gray-400 mb-3 italic">Click on a date to see tryout details and team information.</p>
          <CalendarView listings={filtered} router={router} />
        </>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
