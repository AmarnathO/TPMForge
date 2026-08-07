import { cn } from "@/lib/utils";

/**
 * TPMForge brand mark: a hexagon "competency graph" node with a forge spark.
 * Gradient tile + connected nodes = the competency graph that powers the app.
 */
export function Logo({
  size = 32,
  className,
  withWordmark = false,
  wordmarkClassName,
}: {
  size?: number;
  className?: string;
  withWordmark?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          className="h-full w-full"
          role="img"
          aria-label="TPMForge logo"
        >
          <defs>
            <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="55%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            <linearGradient id="logo-glow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c7d2fe" />
              <stop offset="100%" stopColor="#f5d0fe" />
            </linearGradient>
          </defs>
          <rect
            x="1"
            y="1"
            width="30"
            height="30"
            rx="9"
            fill="url(#logo-bg)"
          />
          <g
            fill="none"
            stroke="url(#logo-glow)"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="16" cy="16" r="9.5" strokeWidth="2.4" />
            <circle cx="9.5" cy="9.5" r="2.1" fill="url(#logo-glow)" stroke="none" />
            <circle cx="22.5" cy="10" r="2.1" fill="url(#logo-glow)" stroke="none" />
            <circle cx="20.5" cy="23" r="2.1" fill="url(#logo-glow)" stroke="none" />
            <line x1="10.5" y1="10.5" x2="14.2" y2="14.2" strokeWidth="1.4" />
            <line x1="21.4" y1="11.2" x2="18" y2="14.5" strokeWidth="1.4" />
            <line x1="19.4" y1="21.9" x2="17.2" y2="18.2" strokeWidth="1.4" />
            <path
              d="M16 12.5v6M13.5 15.5h5"
              stroke="#312e81"
              strokeWidth="1.3"
              opacity="0.75"
            />
          </g>
        </svg>
      </span>
      {withWordmark && (
        <span
          className={cn(
            "text-[15px] font-semibold tracking-tight text-zinc-100",
            wordmarkClassName
          )}
        >
          TPMForge
        </span>
      )}
    </span>
  );
}
