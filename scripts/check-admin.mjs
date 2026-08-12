import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
if (listError) throw listError;
console.log("auth users:", listData.users.map((u) => ({ id: u.id, email: u.email })));

const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*");
console.log("profiles error:", profilesError);
console.log("profiles rows:", profiles);
