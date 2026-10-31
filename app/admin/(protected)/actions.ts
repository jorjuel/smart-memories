'use server';

import { revalidatePath } from 'next/cache';

import {
  createSupabaseServerClient,
} from '../../../lib/supabaseServer';

import {
  supabaseAdmin,
} from '../../../lib/supabaseAdmin';

async function verifyOwner() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const allowedEmails =
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) =>
        email.trim().toLowerCase()
      )
      .filter(Boolean);

  const email =
    user.email?.toLowerCase() || '';

  if (!allowedEmails.includes(email)) {
    throw new Error('Not authorised');
  }
}

export async function updateMemoryStatus(
  formData: FormData
) {
  await verifyOwner();

  const id =
    formData.get('id')?.toString();

  const status =
    formData
      .get('status')
      ?.toString();

  if (!id) {
    throw new Error(
      'Memory ID is missing'
    );
  }

  if (
    ![
      'new',
      'in_production',
      'completed',
    ].includes(status || '')
  ) {
    throw new Error(
      'Invalid status'
    );
  }

  const admin =
    supabaseAdmin();

  const completedAt =
    status === 'completed'
      ? new Date().toISOString()
      : null;

  const {
    error,
  } = await admin
    .from('memories')
    .update({
      status,
      completed_at:
        completedAt,
    })
    .eq('id', id);

  if (error) {
    throw new Error(
      error.message
    );
  }

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/orders'
  );

  revalidatePath(
    '/admin/completed'
  );

  revalidatePath(
    '/admin/memories'
  );
}