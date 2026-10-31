'use server';

import { redirect } from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../../lib/supabaseServer';

export async function customerRegister(
  formData: FormData
) {
  const email =
    formData
      .get('email')
      ?.toString()
      .trim()
      .toLowerCase();

  const password =
    formData
      .get('password')
      ?.toString();

  const confirmPassword =
    formData
      .get('confirmPassword')
      ?.toString();

  if (
    !email ||
    !password ||
    !confirmPassword
  ) {
    redirect(
      '/account/register?error=missing'
    );
  }

  if (
    password !==
    confirmPassword
  ) {
    redirect(
      '/account/register?error=match'
    );
  }

  if (
    password.length < 8
  ) {
    redirect(
      '/account/register?error=short'
    );
  }

  const ownerEmails =
    (
      process.env.ADMIN_EMAILS ||
      ''
    )
      .split(',')
      .map((value) =>
        value
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

  if (
    ownerEmails.includes(
      email
    )
  ) {
    redirect(
      '/account/register?error=owner'
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } =
    await supabase.auth
     .signUp({
  email,
  password,

  options: {
    emailRedirectTo:
      'http://localhost:3000/auth/callback?next=/account',
  },
});

  if (error) {
    redirect(
      `/account/register?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  if (data.session) {
    redirect('/account');
  }

  redirect(
    '/account/login?message=check-email'
  );
}