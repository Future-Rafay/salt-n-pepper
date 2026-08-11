"use client";

import { adminAction } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function StaffToggle({ id, active, returnTo }: { id: string; active: boolean; returnTo: string }) {
  const action = active ? "Deactivate" : "Reactivate";
  return <Dialog><DialogTrigger asChild><Button variant={active ? "destructive" : "outline"}>{action}</Button></DialogTrigger><DialogContent><DialogTitle>{action} staff account</DialogTitle><DialogDescription>{active ? "This signs the staff member out and blocks future access until reactivated." : "This restores staff access."}</DialogDescription><form action={adminAction} className="mt-6"><input type="hidden" name="intent" value="staff_active" /><input type="hidden" name="id" value={id} /><input type="hidden" name="active" value={String(!active)} /><input type="hidden" name="returnTo" value={returnTo} /><div className="flex justify-end gap-3"><DialogClose asChild><Button variant="outline">Keep current access</Button></DialogClose><Button type="submit" variant={active ? "destructive" : "primary"}>Confirm {action.toLowerCase()}</Button></div></form></DialogContent></Dialog>;
}
