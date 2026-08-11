export function BrandLogo({ compact = false, className = "" }: { compact?: boolean; priority?: boolean; className?: string }) {
  return (
    <span role="img" aria-label="SaltNPepper" className={`inline-flex items-baseline whitespace-nowrap font-display text-2xl leading-none tracking-[-0.06em] text-primary ${className}`}>
      {compact ? "SNP" : <><span>Salt</span><span className="text-secondary">N</span><span>Pepper</span></>}
    </span>
  );
}
