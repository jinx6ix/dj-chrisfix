import { signIn } from "./actions";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="glass mx-auto max-w-sm p-8">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard sign in</h1>
      {error && <p role="alert" className="mb-4 text-sm text-red-300">{error === "forbidden" ? "Your account has no dashboard access." : "Invalid email or password."}</p>}
      <form action={signIn} className="space-y-4">
        <label className="block text-sm"><span className="mb-1 block text-muted">Email</span><input name="email" type="email" required autoComplete="email" className="field" /></label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Password</span><input name="password" type="password" required autoComplete="current-password" className="field" /></label>
        <button className="btn w-full justify-center">Sign in</button>
      </form>
    </div>
  );
}
