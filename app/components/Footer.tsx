export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-transparent to-black/30 text-white">
      {/* subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 19px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 21px), repeating-linear-gradient(0deg, transparent 0px, transparent 23px, rgba(0,0,0,0.03) 24px, rgba(0,0,0,0.03) 25px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-sm text-purple-200/80">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-purple-400" />
            <span>JIMFF × AC&apos;SCENT · AI Perfume Curation</span>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} NEANDER Corporation. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}


