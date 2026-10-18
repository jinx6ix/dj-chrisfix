"use server";

import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const STATUSES = ["new", "contacted", "negotiating", "confirmed", "completed", "cancelled", "archived"] as const;

export async function updateInquiryDetail(fd: FormData) {
  const { user } = await requireRole(["booking_manager"]);
  const sb = supabaseAdmin();

  const id = z.string().uuid().parse(fd.get("id"));
  const status = z.enum(STATUSES).parse(fd.get("status"));
  const internal_notes = z.string().trim().max(4000).optional().nullable().parse(fd.get("internal_notes"));
  const follow_up_on = z.string().optional().nullable().parse(fd.get("follow_up_on") || null);
  const assigned_to = z.string().uuid().optional().nullable().parse(fd.get("assigned_to") || null);

  const { error } = await sb
    .from("booking_inquiries")
    .update({
      status,
      internal_notes,
      follow_up_on: follow_up_on || null,
      assigned_to: assigned_to || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect("/dashboard/bookings?error=save");
  }

  await sb.from("audit_logs").insert({
    actor: user.id,
    action: `inquiry.${status}`,
    entity: "booking_inquiries",
    entity_id: id,
  });

  revalidatePath("/dashboard/bookings");
  redirect("/dashboard/bookings?ok=1");
}
