"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AdminFormDialog({ trigger, title, description, children, variant = "outline" }: { trigger: string; title: string; description?: string; children: ReactNode; variant?: "outline" | "primary" }) {
  return <Dialog><DialogTrigger asChild><Button type="button" variant={variant}>{trigger}</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}<div className="mt-5">{children}</div></DialogContent></Dialog>;
}
