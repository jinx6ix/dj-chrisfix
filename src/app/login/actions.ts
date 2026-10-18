"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function signIn(fd: FormData) {
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? "") });
  if (error) redirect("/login?error=invalid");
  redirect("/dashboard");
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/login");
}
