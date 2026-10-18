/** Maps an https URL on an allow-listed provider to its official embed URL. Never fetches the URL (no SSRF surface). */
export function embedSrc(raw?: string | null): string | null {
  if (!raw) return null;
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "");
  if (host === "soundcloud.com") return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&color=%23ff9f43&visual=false`;
  if (host === "mixcloud.com") return `https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(u.pathname)}&dark=1&hide_cover=1`;
  if (host === "youtube.com" || host === "youtu.be") {
    const id = host === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  return null;
}
