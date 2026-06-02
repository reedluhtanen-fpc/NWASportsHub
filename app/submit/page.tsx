"use client";

import { useState } from "react";
import { SPORTS, AGE_GROUPS_BY_SPORT, CATEGORIES } from "@/lib/constants";

const EMPTY = {
  sport: "Baseball",
  teamName: "",
  organization: "",
  category: "",
  level: "",
  ageGroup: "",
  city: "",
  zip: "",
  coachName: "",
  coachContact: "",
  coachEmail: "",
  practiceLocation: "",
  tryoutDate: "",
  tryoutTime: "",
  tryoutLocation: "",
  tryoutAddress: "",
  tryoutDate2: "",
  tryoutTime2: "",
  tryoutLocation2: "",
  tryoutAddress2: "",
  tryoutDate3: "",
  tryoutTime3: "",
  tryoutLocation3: "",
  tryoutAddress3: "",
  website: "",
  registrationUrl: "",
  notes: "",
};

export default function SubmitPage() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function set(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "sport" ? { ageGroup: "" } : {}),
    }));
  }

  const ageGroups = form.sport ? AGE_GROUPS_BY_SPORT[form.sport] ?? [] : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm(EMPTY);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-[#1a4d2e] mb-2">Submission Received!</h1>
        <p className="text-gray-500 mb-6">
          Thanks for submitting. We'll review your listing and add it to the directory shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="bg-[#34a85a] hover:bg-[#276845] text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-[#1a4d2e] mb-1">Add a Team or League</h1>
      <p className="text-gray-500 text-sm mb-8">
        Submissions are reviewed before being published. All fields marked * are required.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-6">

        <FormSection title="Basic Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Team Name *">
              <input required value={form.teamName} onChange={(e) => set("teamName", e.target.value)} placeholder="e.g. Bentonville Blaze 12U" />
            </Field>
            <Field label="Organization / League">
              <input value={form.organization} onChange={(e) => set("organization", e.target.value)} placeholder="e.g. Bentonville Baseball Club" />
            </Field>
            <Field label="Age Group *">
              <select required value={form.ageGroup} onChange={(e) => set("ageGroup", e.target.value)} disabled={!form.sport}>
                <option value="">{form.sport ? "Select age group" : "Select sport first"}</option>
                {ageGroups.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Category *">
              <select required value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Level / League (if Competitive)">
              <input value={form.level} onChange={(e) => set("level", e.target.value)} placeholder="e.g. AAA, ECNL, Heartland Tier 2" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City *">
              <input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Bentonville" />
            </Field>
            <Field label="ZIP Code">
              <input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="e.g. 72712" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Tryout Information">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date">
              <input type="date" value={form.tryoutDate} onChange={(e) => set("tryoutDate", e.target.value)} />
            </Field>
            <Field label="Time">
              <input value={form.tryoutTime} onChange={(e) => set("tryoutTime", e.target.value)} placeholder="e.g. 5:00–7:00 PM" />
            </Field>
            <Field label="Location">
              <input value={form.tryoutLocation} onChange={(e) => set("tryoutLocation", e.target.value)} placeholder="e.g. Orchards Park Field 3" />
            </Field>
            <Field label="Address (for directions)">
              <input value={form.tryoutAddress} onChange={(e) => set("tryoutAddress", e.target.value)} placeholder="e.g. 1200 SE 14th St, Bentonville, AR 72712" />
            </Field>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-[#276845] mt-4 mb-2">Alternate Tryout Date (optional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date">
              <input type="date" value={form.tryoutDate2} onChange={(e) => set("tryoutDate2", e.target.value)} />
            </Field>
            <Field label="Time">
              <input value={form.tryoutTime2} onChange={(e) => set("tryoutTime2", e.target.value)} placeholder="e.g. 5:00–7:00 PM" />
            </Field>
            <Field label="Location">
              <input value={form.tryoutLocation2} onChange={(e) => set("tryoutLocation2", e.target.value)} placeholder="e.g. Orchards Park Field 3" />
            </Field>
            <Field label="Address (for directions)">
              <input value={form.tryoutAddress2} onChange={(e) => set("tryoutAddress2", e.target.value)} placeholder="e.g. 1200 SE 14th St, Bentonville, AR 72712" />
            </Field>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-[#276845] mt-4 mb-2">Second Alternate Tryout Date (optional)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date">
              <input type="date" value={form.tryoutDate3} onChange={(e) => set("tryoutDate3", e.target.value)} />
            </Field>
            <Field label="Time">
              <input value={form.tryoutTime3} onChange={(e) => set("tryoutTime3", e.target.value)} placeholder="e.g. 5:00–7:00 PM" />
            </Field>
            <Field label="Location">
              <input value={form.tryoutLocation3} onChange={(e) => set("tryoutLocation3", e.target.value)} placeholder="e.g. Orchards Park Field 3" />
            </Field>
            <Field label="Address (for directions)">
              <input value={form.tryoutAddress3} onChange={(e) => set("tryoutAddress3", e.target.value)} placeholder="e.g. 1200 SE 14th St, Bentonville, AR 72712" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Practice Location">
          <Field label="Location">
            <input value={form.practiceLocation} onChange={(e) => set("practiceLocation", e.target.value)} placeholder="e.g. Memorial Park" />
          </Field>
        </FormSection>

        <FormSection title="Contact">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Name">
              <input value={form.coachName} onChange={(e) => set("coachName", e.target.value)} placeholder="e.g. John Smith" />
            </Field>
            <Field label="Contact Phone">
              <input type="tel" value={form.coachContact} onChange={(e) => set("coachContact", e.target.value)} placeholder="e.g. 479-555-1234" />
            </Field>
            <Field label="Contact Email">
              <input type="email" value={form.coachEmail} onChange={(e) => set("coachEmail", e.target.value)} placeholder="e.g. coach@email.com" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Additional Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Website">
              <input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Registration Form URL">
              <input type="url" value={form.registrationUrl} onChange={(e) => set("registrationUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Anything else parents should know..."
                  className="resize-none"
                />
              </Field>
            </div>
          </div>
        </FormSection>

        {status === "error" && (
          <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#34a85a] hover:bg-[#276845] disabled:opacity-60 text-white font-bold px-8 py-3 rounded-full text-base transition-colors self-start"
        >
          {status === "loading" ? "Submitting..." : "Submit Listing"}
        </button>
      </form>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#276845] mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 [&_input]:w-full [&_input]:border [&_input]:border-gray-200 [&_input]:rounded-lg [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm [&_input]:focus:outline-none [&_input]:focus:ring-2 [&_input]:focus:ring-[#34a85a] [&_select]:w-full [&_select]:border [&_select]:border-gray-200 [&_select]:rounded-lg [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm [&_select]:focus:outline-none [&_select]:focus:ring-2 [&_select]:focus:ring-[#34a85a] [&_select]:bg-white [&_textarea]:w-full [&_textarea]:border [&_textarea]:border-gray-200 [&_textarea]:rounded-lg [&_textarea]:px-3 [&_textarea]:py-2 [&_textarea]:text-sm [&_textarea]:focus:outline-none [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-[#34a85a]">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}
