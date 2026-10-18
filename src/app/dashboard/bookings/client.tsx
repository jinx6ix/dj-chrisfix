"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { Calendar, Search, Filter, Mail, Phone, Building, UserCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { updateInquiryDetail } from "./actions";

interface BookingInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  event_type: string;
  event_date: string;
  venue?: string;
  audience_size?: number;
  duration_minutes?: number;
  budget_range?: string;
  details?: string;
  status: string;
  assigned_to?: string;
  follow_up_on?: string;
  internal_notes?: string;
  created_at: string;
}

const STATUSES = ["new", "contacted", "negotiating", "confirmed", "completed", "cancelled", "archived"];

export default function BookingsAdminClient({ initialInquiries, staffList }: { initialInquiries: BookingInquiry[]; staffList: { user_id: string; email?: string }[] }) {
  const [inquiries, setInquiries] = useState<BookingInquiry[]>(initialInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = inquiries.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      (b.organization?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (b.venue?.toLowerCase().includes(search.toLowerCase()) ?? false);

    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="glass p-8 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Calendar} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Booking CRM</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Inquiries</h1>
        <p className="text-muted text-sm">
          Manage booking requests, assign staff, track negotiation status, set follow-up dates, and add internal notes.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, organization, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-9 w-full"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold transition ${statusFilter === "all" ? 'bg-[#ff9f43] text-black font-bold' : 'glass hover:bg-white/10 text-muted'}`}
            >
              All
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold transition ${statusFilter === s ? 'bg-[#ff9f43] text-black font-bold' : 'glass hover:bg-white/10 text-muted'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((b) => (
          <GlassCard key={b.id} className="p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold">{b.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold ${
                    b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    b.status === 'negotiating' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    b.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-white/5 text-muted border border-white/10'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  Event: <strong className="text-white">{b.event_type}</strong> on <strong className="text-white">{b.event_date}</strong>
                  {b.venue && ` at ${b.venue}`}
                </p>
              </div>

              <form action={updateInquiryDetail} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={b.id} />
                <select name="status" defaultValue={b.status} aria-label="Status" className="field w-auto text-xs py-1.5">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button className="btn btn-ghost text-xs py-1.5">Save</button>
              </form>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2 text-xs text-muted border-t border-white/10">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#ff9f43]" />
                <a href={`mailto:${b.email}`} className="underline truncate">{b.email}</a>
              </div>
              {b.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-cyan-400" />
                  <span>{b.phone}</span>
                </div>
              )}
              {b.organization && (
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-violet-400" />
                  <span className="truncate">{b.organization}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-emerald-400" />
                <span>Submitted {new Date(b.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {(b.audience_size || b.duration_minutes || b.budget_range) && (
              <div className="flex flex-wrap gap-4 text-xs bg-white/5 p-3 rounded-lg border border-white/10">
                {b.audience_size && <div>Audience: <strong className="text-white">{b.audience_size}</strong></div>}
                {b.duration_minutes && <div>Set Duration: <strong className="text-white">{b.duration_minutes} min</strong></div>}
                {b.budget_range && <div>Budget: <strong className="text-white">{b.budget_range}</strong></div>}
              </div>
            )}

            {b.details && (
              <p className="text-sm bg-black/30 p-3 rounded-lg border border-white/10 text-white/90 whitespace-pre-line">
                {b.details}
              </p>
            )}

            <form action={updateInquiryDetail} className="grid gap-3 sm:grid-cols-3 pt-3 border-t border-white/10">
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="status" value={b.status} />
              <label className="text-xs">
                <span className="mb-1 block text-muted">Follow-up Date</span>
                <input type="date" name="follow_up_on" defaultValue={b.follow_up_on || ""} className="field text-xs py-1.5" />
              </label>
              <label className="text-xs">
                <span className="mb-1 block text-muted">Assigned Staff</span>
                <select name="assigned_to" defaultValue={b.assigned_to || ""} className="field text-xs py-1.5">
                  <option value="">Unassigned</option>
                  {staffList.map((st) => (
                    <option key={st.user_id} value={st.user_id}>{st.email || st.user_id}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs sm:col-span-3">
                <span className="mb-1 block text-muted">Internal Notes</span>
                <textarea name="internal_notes" rows={2} defaultValue={b.internal_notes || ""} placeholder="Add confidential notes for staff..." className="field text-xs" />
              </label>
              <div>
                <button className="btn btn-ghost text-xs py-1.5">Update Notes & Assignment</button>
              </div>
            </form>
          </GlassCard>
        ))}

        {filtered.length === 0 && (
          <GlassCard className="p-12 text-center text-muted text-sm">
            No booking inquiries found matching your search.
          </GlassCard>
        )}
      </div>
    </div>
  );
}
