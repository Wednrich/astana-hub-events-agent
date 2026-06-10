"use client";

export function LogoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 backdrop-blur-sm transition-all duration-300 ${
        className || "h-10 w-10"
      }`}
    >
      <span className="text-xs font-bold tracking-widest opacity-60" style={{ color: "var(--text-primary)" }}>
        LOGO
      </span>
    </div>
  );
}