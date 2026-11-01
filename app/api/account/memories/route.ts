import {
  NextResponse,
} from 'next/server';

import {
  createSupabaseServerClient,
} from '@/lib/supabaseServer';

import {
  getCustomerMemories,
} from '@/lib/customerMemories';

export async function GET() {
  try {
    const auth =
      await createSupabaseServerClient();

    const {
      data: {
        user,
      },
    } =
      await auth.auth
        .getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Authentication required.',
        },
        {
          status: 401,
        }
      );
    }

    const memories =
      await getCustomerMemories(
        user.id
      );

    return NextResponse.json(
      memories
    );
  } catch (
    error
  ) {
    console.error(
      'ACCOUNT MEMORIES ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Could not load your memories.',
      },
      {
        status: 500,
      }
    );
  }
}