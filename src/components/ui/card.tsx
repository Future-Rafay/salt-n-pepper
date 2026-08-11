import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type CardProps = ComponentProps<"section"> & {
  hover?: boolean;
};

export function Card({ className, hover = false, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] border border-border/80 bg-surface/90 backdrop-blur-sm p-6 shadow-[0_4px_20px_-4px_rgba(33,26,29,0.05)] transition-all duration-300",
        hover && "hover:shadow-[0_12px_30px_-6px_rgba(106,31,61,0.12)] hover:-translate-y-1 hover:border-secondary/40",
        className,
      )}
      {...props}
    />
  );
}

