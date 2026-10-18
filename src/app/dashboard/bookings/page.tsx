import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import BookingsAdminClient from "./client";

export const metadata = { title: "Booking inquiries" };
export const dynamic = "force-dynamic";

export default async function BookingsAdmin({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { sb } = await requireRole(["booking_manager"]);
  const sp = await searchParams;
  const adminSb = supabaseAdmin();

  const { data: inquiries } = await adminSb
    .from("booking_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: memberships } = await adminSb
    .from("memberships")
    .select("user_id, role");

  const staffList = memberships || [];

  return (
    <div className="space-y-6">
      {sp.ok && <p role="status" className="glass p-3 text-sm text-emerald-300">Booking inquiry updated successfully.</p>}
      {sp.error && <p role="alert" className="text-red-300 text-sm">Could not update the inquiry.</p>}

      <BookingsAdminClient initialInquiries={inquiries || []} staffList={staffList} />
    </div>
  );
}
