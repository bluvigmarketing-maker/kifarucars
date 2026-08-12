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
    <div className="flex min-h-screen items-center justify-center bg-charcoal-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-charcoal-100 bg-white p-8 shadow-sm">
        <p className="font-display text-2xl text-charcoal-950">Kifaru</p>
        <p className="mt-1 text-sm text-charcoal-500">Admin dashboard sign in</p>

        <div className="mt-6">
          <LoginForm initialError={errorParam ? ERROR_MESSAGES[errorParam] : undefined} />
        </div>
      </div>
    </div>
  );
}
