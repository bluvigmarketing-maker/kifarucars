// One-off script to create the first admin user + matching profiles row.
// Run with: node --env-file=.env.local scripts/create-admin.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const email = "admin@carhire.kifaru.ke";
const password = "Kifarucars@#2026!";

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: createData, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

let user = createData?.user;

if (createError) {
  if (createError.code !== "email_exists") {
    throw createError;
  }
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  user = listData.users.find((u) => u.email === email);
  if (!user) throw new Error("User reported as existing but not found in listUsers().");
}

const { error: profileError } = await supabase
  .from("profiles")
  .upsert({ id: user.id, email, role: "admin" });

if (profileError) {
  throw profileError;
}

console.log(`Admin user ready: ${email} (${user.id})`);
