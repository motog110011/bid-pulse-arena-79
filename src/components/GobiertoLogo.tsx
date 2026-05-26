import { cn } from "@/lib/utils";

interface GobiertoLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const EscudoNacional = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Escudo Nacional Mexicano"
    role="img"
  >
    {/* Fondo oval escudo */}
    <ellipse cx="40" cy="42" rx="36" ry="34" fill="#1a6b2a" />
    <ellipse cx="40" cy="42" rx="33" ry="31" fill="#1d7a30" />

    {/* Nopal central */}
    <ellipse cx="40" cy="48" rx="8" ry="10" fill="#2d9c45" stroke="#1a5c20" strokeWidth="0.8" />
    <ellipse cx="30" cy="44" rx="7" ry="9" fill="#2d9c45" stroke="#1a5c20" strokeWidth="0.8" />
    <ellipse cx="50" cy="44" rx="7" ry="9" fill="#2d9c45" stroke="#1a5c20" strokeWidth="0.8" />
    {/* Espinas */}
    <line x1="35" y1="43" x2="33" y2="40" stroke="#1a5c20" strokeWidth="0.6" />
    <line x1="40" y1="42" x2="38" y2="39" stroke="#1a5c20" strokeWidth="0.6" />
    <line x1="45" y1="43" x2="47" y2="40" stroke="#1a5c20" strokeWidth="0.6" />
    {/* Tunas */}
    <circle cx="36" cy="41" r="2.5" fill="#c0392b" />
    <circle cx="44" cy="41" r="2.5" fill="#c0392b" />
    <circle cx="40" cy="39" r="2.5" fill="#c0392b" />

    {/* Tronco del nopal */}
    <rect x="37" y="54" width="6" height="8" rx="2" fill="#8B6914" />

    {/* Roca / islote */}
    <ellipse cx="40" cy="62" rx="14" ry="5" fill="#8B7355" />
    <ellipse cx="40" cy="62" rx="12" ry="3.5" fill="#A08B60" />

    {/* Agua */}
    <ellipse cx="40" cy="65" rx="30" ry="5" fill="#1a5c8a" opacity="0.7" />

    {/* Águila - cuerpo */}
    <ellipse cx="40" cy="35" rx="10" ry="8" fill="#4a3728" />
    {/* Cabeza águila */}
    <circle cx="40" cy="24" r="6" fill="#4a3728" />
    {/* Pico */}
    <path d="M44 25 L48 27 L44 29 Z" fill="#C9A84C" />
    {/* Ojo */}
    <circle cx="42" cy="24" r="1.5" fill="#C9A84C" />
    <circle cx="42.5" cy="24" r="0.7" fill="#1a1a1a" />
    {/* Corona de plumas cabeza */}
    <path d="M36 21 Q38 17 40 19 Q42 17 44 21" stroke="#4a3728" strokeWidth="1.5" fill="none" />
    {/* Ala izquierda */}
    <path d="M30 33 Q18 28 14 38 Q22 42 30 38 Z" fill="#5a4535" />
    {/* Ala derecha */}
    <path d="M50 33 Q62 28 66 38 Q58 42 50 38 Z" fill="#5a4535" />
    {/* Garras sosteniendo serpiente */}
    <path d="M34 43 Q30 50 28 48" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M46 43 Q50 50 52 48" stroke="#4a3728" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Serpiente */}
    <path d="M28 47 Q35 52 40 50 Q45 48 52 47 Q56 50 54 54" stroke="#2d8a3a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

    {/* Corona de laurel */}
    <path
      d="M12 50 Q8 44 10 38 Q14 32 20 30"
      stroke="#C9A84C"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M68 50 Q72 44 70 38 Q66 32 60 30"
      stroke="#C9A84C"
      strokeWidth="2"
      fill="none"
    />
    {/* Hojas de laurel izquierda */}
    {[34, 30, 26].map((y, i) => (
      <ellipse
        key={`leaf-l-${i}`}
        cx={15 + i * 2}
        cy={y}
        rx="3"
        ry="5"
        transform={`rotate(${-30 + i * 10} ${15 + i * 2} ${y})`}
        fill="#C9A84C"
        opacity="0.85"
      />
    ))}
    {/* Hojas de laurel derecha */}
    {[34, 30, 26].map((y, i) => (
      <ellipse
        key={`leaf-r-${i}`}
        cx={65 - i * 2}
        cy={y}
        rx="3"
        ry="5"
        transform={`rotate(${30 - i * 10} ${65 - i * 2} ${y})`}
        fill="#C9A84C"
        opacity="0.85"
      />
    ))}

    {/* Borde del escudo */}
    <ellipse cx="40" cy="42" rx="36" ry="34" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
  </svg>
);

export const GobiertoLogo = ({ className, size = "md", showName = true }: GobiertoLogoProps) => {
  const sizeConfig = {
    sm: { svg: "w-8 h-8", title: "text-sm", subtitle: "text-[10px]" },
    md: { svg: "w-12 h-12", title: "text-base", subtitle: "text-xs" },
    lg: { svg: "w-16 h-16", title: "text-xl", subtitle: "text-sm" },
  }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <EscudoNacional className={sizeConfig.svg} />
      {showName && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-black tracking-tight leading-none text-gobierno-guinda",
              sizeConfig.title
            )}
            style={{ fontFamily: "'Montserrat', system-ui, sans-serif", letterSpacing: "-0.02em" }}
          >
            SUBASTAS GAP
          </span>
          <span
            className={cn("text-gobierno-dorado font-semibold uppercase tracking-widest", sizeConfig.subtitle)}
            style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
          >
            Gobierno de México
          </span>
        </div>
      )}
    </div>
  );
};
