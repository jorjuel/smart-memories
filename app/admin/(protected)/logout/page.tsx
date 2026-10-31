import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../../../lib/supabaseServer';

export default async function LogoutPage() {
  const supabase =
    await createSupabaseServerClient();

  await supabase.auth
    .signOut();

  redirect(
    '/admin/login'
  );
}