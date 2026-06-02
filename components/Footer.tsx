export default function Footer() {
  return (
    <footer className="bg-[#0d2b1a] text-white/60 text-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          <span className="text-[#6dcf90] font-bold">NWA Sports Hub</span> — Northwest Arkansas Youth Sports Directory
        </span>
        <span>© {new Date().getFullYear()} All rights reserved</span>
      </div>
    </footer>
  );
}
