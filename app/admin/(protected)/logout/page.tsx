import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseAdminAuthClient,
} from '../../../../lib/supabaseAdminAuthServer';

export default async function LogoutPage() {
  const supabase =
    await createSupabaseAdminAuthClient();

  await supabase.auth
    .signOut();

  redirect(
    '/admin/login'
  );
}