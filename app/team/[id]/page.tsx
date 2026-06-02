import { getListings } from "@/lib/sheets";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listings = await getListings();
  const team = listings.find((l) => l.id === id);

  if (!team) notFound();

  const isBaseball = team.sport === "Baseball";

  return (
    <div className="min-h-screen bg-[#f0f4f1] flex flex-col items-center py-10 px-4">
      <Link href={`/browse?sport=${encodeURIComponent(team.sport)}`} className="text-[#34a85a] text-sm font-medium hover:underline mb-6 self-start max-w-sm w-full mx-auto">
        ← Back to Full Team List
      </Link>

      {/* Trading Card */}
      <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-[#1a4d2e] bg-white" style={{fontFamily: "'Inter', sans-serif"}}>

        {/* Card Header */}
        <div className="relative bg-[#1a4d2e] px-6 pt-6 pb-10 text-center"
          style={{background: "linear-gradient(135deg, #0d2b1a 0%, #1a4d2e 50%, #276845 100%)"}}>

          {/* Sport badge */}
          <div className="absolute top-4 left-4 bg-black/30 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-widest">
            {team.sport}
          </div>

          {/* Age group badge */}
          <div className="absolute top-4 right-4 bg-[#34a85a] text-white text-sm font-black px-3 py-1 rounded-full">
            {team.ageGroup}
          </div>

          {/* Big sport emoji */}
          <div className="text-7xl mb-3 mt-2 drop-shadow-lg">{isBaseball ? "⚾" : "⚽"}</div>

          {/* Team name */}
          <h1 className="text-white font-black text-2xl leading-tight tracking-tight drop-shadow">
            {team.teamName}
          </h1>
          {team.organization && (
            <p className="text-white/60 text-xs mt-1 uppercase tracking-widest">{team.organization}</p>
          )}

          {/* Category / level pills */}
          <div className="flex justify-center gap-2 mt-3">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
              {team.category}
            </span>
            {team.level && (
              <span className="bg-[#34a85a]/80 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                {team.level}
              </span>
            )}
          </div>

          {/* Decorative bottom curve */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-[2rem]" />
        </div>

        {/* Card Body */}
        <div className="px-6 pt-2 pb-6 flex flex-col gap-5">

          {/* Location */}
          {(team.city || team.zip) && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📍</span>
              <span>{team.city}{team.zip ? `, ${team.zip}` : ""}</span>
            </div>
          )}

          {/* Tryouts */}
          {(team.tryoutDate || team.tryoutDate2 || team.tryoutDate3) && (
            <CardSection title="Tryouts">
              <div className="flex flex-col gap-4">
                {[
                  { date: team.tryoutDate, time: team.tryoutTime, location: team.tryoutLocation, address: team.tryoutAddress },
                  { date: team.tryoutDate2, time: team.tryoutTime2, location: team.tryoutLocation2, address: team.tryoutAddress2 },
                  { date: team.tryoutDate3, time: team.tryoutTime3, location: team.tryoutLocation3, address: team.tryoutAddress3 },
                ]
                  .filter((t) => t.date || t.location)
                  .map((t, i) => (
                    <TryoutBlock key={i} index={i} date={t.date} time={t.time} location={t.location} address={t.address} />
                  ))}
              </div>
            </CardSection>
          )}

          {/* Practice */}
          {team.practiceLocation && (
            <CardSection title="Practice">
              <Stat label="Location" value={team.practiceLocation} wide />
            </CardSection>
          )}

          {/* Contact */}
          {(team.coachName || team.coachContact || team.coachEmail) && (
            <CardSection title="Contact">
              <div className="flex flex-col gap-1.5 text-sm">
                {team.coachName && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Name</div>
                    <div className="font-semibold text-gray-800">{team.coachName}</div>
                  </div>
                )}
                {team.coachContact && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Phone</div>
                    <a href={`tel:${team.coachContact.replace(/\D/g, "")}`} className="font-semibold text-[#34a85a] hover:underline">{team.coachContact}</a>
                  </div>
                )}
                {team.coachEmail && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Email</div>
                    <a href={`mailto:${team.coachEmail}`} className="font-semibold text-[#34a85a] hover:underline break-all">{team.coachEmail}</a>
                  </div>
                )}
              </div>
            </CardSection>
          )}

          {/* Registration */}
          {team.registrationUrl && (
            <div className="pt-2">
              <a
                href={team.registrationUrl.startsWith("http") ? team.registrationUrl : `https://${team.registrationUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#34a85a] hover:bg-[#276845] text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                📋 Register / Sign Up
              </a>
            </div>
          )}

          {/* Website / Notes */}
          {(team.website || team.notes) && (
            <CardSection title="More Info">
              {team.website && (
                <a
                  href={team.website.startsWith("http") ? team.website : `https://${team.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#34a85a] text-sm hover:underline"
                >
                  Link to team website
                </a>
              )}
              {team.notes && <p className="text-sm text-gray-500 mt-1">{team.notes}</p>}
            </CardSection>
          )}
        </div>

        {/* Card Footer */}
        <div className="bg-[#0d2b1a] px-6 py-3 flex items-center justify-center gap-2">
          <img src="/logo.svg" alt="NWA Sports Hub" className="h-6 w-6 rounded-full" />
          <span className="text-[#6dcf90] text-xs font-bold tracking-widest uppercase">NWA Sports Hub</span>
        </div>
      </div>
    </div>
  );
}

function CardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-[#276845] mb-2">{title}</h2>
      {children}
    </div>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function TryoutBlock({ index, date, time, location, address }: {
  index: number; date?: string; time?: string; location?: string; address?: string;
}) {
  return (
    <div className={index > 0 ? "border-t border-dashed border-gray-200 pt-3" : ""}>
      {index > 0 && (
        <p className="text-[10px] uppercase tracking-widest text-gray-300 mb-2">Option {index + 1}</p>
      )}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {date && <Stat label="Date" value={date} />}
        {time && <Stat label="Time" value={time} />}
        {location && <Stat label="Location" value={location} wide />}
      </div>
      {address && (
        <div className="mt-2">
          <p className="text-xs text-gray-400 mb-1.5">{address}</p>
          <div className="flex flex-wrap gap-2">
            <MapLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} label="Google Maps" color="bg-[#4285F4]" />
            <MapLink href={`http://maps.apple.com/?q=${encodeURIComponent(address)}`} label="Apple Maps" color="bg-gray-700" />
            <MapLink href={`https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`} label="Waze" color="bg-[#33CCFF]" />
          </div>
        </div>
      )}
    </div>
  );
}

function MapLink({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}
    >
      {label}
    </a>
  );
}
