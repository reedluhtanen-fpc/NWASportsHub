"use client";

import { useEffect, useState } from "react";

interface AgeCutoff {
  authority: string;
  cutoffDate: string;
  notes: string;
}

function calculateAge(dobStr: string, cutoffStr: string): number | null {
  const dob = new Date(dobStr + "T00:00:00");
  const cutoff = new Date(cutoffStr + "T00:00:00");
  if (isNaN(dob.getTime()) || isNaN(cutoff.getTime())) return null;

  let age = cutoff.getFullYear() - dob.getFullYear();
  const cutoffMonthDay = cutoff.getMonth() * 100 + cutoff.getDate();
  const dobMonthDay = dob.getMonth() * 100 + dob.getDate();
  if (dobMonthDay > cutoffMonthDay) age -= 1;

  return age;
}

export default function AgeCalculator() {
  const [cutoffs, setCutoffs] = useState<AgeCutoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [authority, setAuthority] = useState("");
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<{ age: number; authority: string } | null>(null);

  useEffect(() => {
    fetch("/api/age-cutoffs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCutoffs(data);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const cutoff = cutoffs.find((c) => c.authority === authority);
    if (!cutoff || !dob) return;
    const age = calculateAge(dob, cutoff.cutoffDate);
    if (age === null) return;
    setResult({ age, authority: cutoff.authority });
  }

  function reset() {
    setDob("");
    setAuthority("");
    setResult(null);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-md mx-auto">
      <h3 className="font-bold text-[#1a4d2e] text-lg mb-1 flex items-center gap-2">
        <span>🎂</span> What Age Group is My Child?
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        We do not save or store the birthdate you enter. It's used only in your browser to calculate the result.
      </p>

      {result ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-1">Per {result.authority} rules, your child will be in the</p>
          <p className="text-3xl font-black text-[#1a4d2e] mb-3">{result.age}U</p>
          <p className="text-xs text-gray-400 mb-4">division for the Fall 26 / Spring 27 season.</p>
          <button
            onClick={reset}
            className="text-[#34a85a] text-sm font-medium hover:underline"
          >
            Calculate again
          </button>
        </div>
      ) : (
        <form onSubmit={handleCalculate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Governing Authority / League Type</label>
            <select
              required
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              disabled={loading || cutoffs.length === 0}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#34a85a]"
            >
              <option value="">{loading ? "Loading..." : "Select authority"}</option>
              {cutoffs.map((c) => (
                <option key={c.authority} value={c.authority}>{c.authority}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Player's Date of Birth</label>
            <input
              required
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#34a85a]"
            />
          </div>
          <button
            type="submit"
            disabled={!authority || !dob}
            className="bg-[#34a85a] hover:bg-[#276845] disabled:opacity-50 text-white font-bold py-2.5 rounded-full text-sm transition-colors"
          >
            Calculate Age Group
          </button>
        </form>
      )}
    </div>
  );
}
