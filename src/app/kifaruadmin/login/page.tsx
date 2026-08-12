import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  "not-authorized": "That account isn't set up for dashboard access.",
  "supabase-not-configured": "Supabase isn't configured yet — see README.md.",
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/kifaruadmin/login">) {
  const params = await searchParams;
  const errorParam = typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-50 px-4 dark:bg-charcoal-950">
      <div className="w-full max-w-sm rounded-2xl border-2 border-gold-500/60 bg-white p-8 shadow-[0_0_22px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_22px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900">
        <p className="font-display text-2xl text-charcoal-950 dark:text-white">Kifaru</p>
        <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">Admin dashboard sign in</p>

        <div className="mt-6">
          <LoginForm initialError={errorParam ? ERROR_MESSAGES[errorParam] : undefined} />
        </div>
      </div>
    </div>
  );
}
