import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export type Role = "owner" | "editor" | "social_manager" | "booking_manager";

/** Server-side gate. Owner passes everywhere; others need a listed role. RLS enforces the same rules in the database. */
export async function requireRole(allowed: Role[]) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await sb.from("memberships").select("role").eq("user_id", user.id).maybeSingle();
  const role = data?.role as Role | undefined;
  if (!role || (role !== "owner" && !allowed.includes(role))) redirect("/login?error=forbidden");
  return { sb, user, role };
}
