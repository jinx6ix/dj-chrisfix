import { requireRole } from "@/lib/auth";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { ShieldAlert, Users, UserPlus } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const metadata = { title: "Team Settings" };
export const dynamic = "force-dynamic";

const roleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["owner", "editor", "social_manager", "booking_manager"]),
});

async function updateRole(fd: FormData) {
  "use server";
  const { sb } = await requireRole(["owner"]);
  const p = roleSchema.safeParse({
    user_id: fd.get("user_id"),
    role: fd.get("role"),
  });
  if (!p.success) redirect("/dashboard/team?error=invalid");

  const { error } = await sb.from("user_roles").upsert(p.data);
  if (error) redirect("/dashboard/team?error=save");
  revalidatePath("/dashboard/team");
  redirect("/dashboard/team?ok=1");
}

export default async function TeamSettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { sb } = await requireRole(["owner"]);
  const sp = await searchParams;

  const { data: teamMembers } = await sb.from("user_roles").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="glass p-8 space-y-2">
        <div className="flex items-center gap-3">
          <GlassIcon icon={ShieldAlert} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Administration</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
        <p className="text-muted text-sm">
          Manage platform access roles (Owner, Editor, Social Manager, Booking Manager). Restricted to owners.
        </p>
      </div>

      {sp.ok && <p className="glass p-3 text-sm text-emerald-300">Team role updated successfully.</p>}
      {sp.error && <p className="text-red-300 text-sm">Error updating role.</p>}

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Team Members & Permissions</h3>
        {teamMembers?.map((member) => (
          <GlassCard key={member.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm font-mono">{member.user_id}</p>
              <p className="text-xs text-muted">Current Role: <span className="uppercase text-amber-400 font-semibold">{member.role}</span></p>
            </div>
            <form action={updateRole} className="flex gap-2 items-center">
              <input type="hidden" name="user_id" value={member.user_id} />
              <select name="role" defaultValue={member.role} className="field py-1 text-xs">
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="social_manager">Social Manager</option>
                <option value="booking_manager">Booking Manager</option>
              </select>
              <button className="btn btn-ghost text-xs py-1">Save</button>
            </form>
          </GlassCard>
        ))}
        {!teamMembers?.length && (
          <GlassCard className="p-8 text-center text-muted text-sm">
            No team member role records found in database.
          </GlassCard>
        )}
      </div>
    </div>
  );
}
