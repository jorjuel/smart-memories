import {
  createServerClient,
} from '@supabase/ssr';

import {
  cookies,
} from 'next/headers';

export async function createSupabaseAdminAuthClient() {
  const cookieStore =
    await cookies();

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is missing'
    );
  }

  if (!key) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing'
    );
  }

  return createServerClient(
    url,
    key,
    {
      cookieOptions: {
        name: 'smart-memories-admin-auth',
      },

      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                cookieStore.set(
                  name,
                  value,
                  options
                );
              }
            );
          } catch {
            // Cookie writing is not always
            // available inside Server Components.
          }
        },
      },
    }
  );
}