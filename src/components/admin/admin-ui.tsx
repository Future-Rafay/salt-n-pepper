import Link from "next/link";
import { useId, type ComponentProps, type ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

export function AdminPage({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E1E3E5] pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#202223] tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-xs text-muted leading-normal">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Notice({ saved, error, warning }: { saved?: string; error?: string; warning?: string }) {
  if (!saved && !error && !warning) return null;
  return (
    <div
      role={error || warning ? "alert" : "status"}
      className={cn(
        "mb-6 flex items-center gap-3 rounded-xl border p-4 text-xs font-semibold shadow-xs animate-scale-in",
        error
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : warning
            ? "border-amber-500/40 bg-amber-50 text-amber-900"
          : "border-emerald-500/40 bg-emerald-50 text-emerald-800"
      )}
    >
      {error ? (
        <AlertCircle className="h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      )}
      <span>{error ? error.replaceAll("_", " ") : warning ? "Invitation saved, but the email could not be sent. Check the Resend configuration and invite again." : "Changes successfully saved."}</span>
    </div>
  );
}

export function Field({
  label,
  name,
  className,
  ...props
}: { label: string; name: string } & ComponentProps<typeof Input>) {
  const generatedId = useId();
  const inputId = props.id ?? `${name}-${generatedId}`;
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={inputId} className="text-xs font-bold text-[#303030]">
        {label}
      </Label>
      <Input
        {...props}
        id={inputId}
        name={name}
        className="h-10 rounded-lg border-[#C9CCCF] bg-white px-3 text-xs shadow-2xs focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

export function TextareaField({
  label,
  name,
  defaultValue,
  rows = 3,
  id,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  return (
    <div className="space-y-1">
      <Label htmlFor={inputId} className="text-xs font-bold text-[#303030]">
        {label}
      </Label>
      <textarea
        id={inputId}
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        className="w-full rounded-lg border border-[#C9CCCF] bg-white px-3 py-2 text-xs shadow-2xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  children,
  id,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: ReactNode;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? `${name}-${generatedId}`;
  return (
    <div className="space-y-1">
      <Label htmlFor={inputId} className="text-xs font-bold text-[#303030]">
        {label}
      </Label>
      <select
        id={inputId}
        name={name}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-lg border border-[#C9CCCF] bg-white px-3 text-xs font-medium shadow-2xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {children}
      </select>
    </div>
  );
}

export function Check({ label, name, defaultChecked = false }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 text-xs font-bold text-[#303030] cursor-pointer py-1">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-[#C9CCCF] text-primary focus:ring-primary"
      />
      <span>{label}</span>
    </label>
  );
}

export function SaveBar({ returnTo, label = "Save changes" }: { returnTo: string; label?: string }) {
  return (
    <div className="flex justify-end border-t border-[#E1E3E5] pt-4 mt-6">
      <input type="hidden" name="returnTo" value={returnTo} />
      <Button type="submit" size="default" className="shadow-xs font-bold bg-primary hover:bg-primary-light text-xs">
        {label}
      </Button>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <Card className="p-8 text-center border-[#E1E3E5] bg-white">
      <p className="text-xs font-medium text-muted">{children}</p>
    </Card>
  );
}

export function EditLink({ href, children = "Manage" }: { href: string; children?: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center rounded-lg border border-[#C9CCCF] bg-white px-3 text-xs font-bold text-[#303030] shadow-2xs hover:bg-[#F6F6F7] transition-all"
    >
      {children}
    </Link>
  );
}

