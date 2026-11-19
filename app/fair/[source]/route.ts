import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ source: string }> };

async function openGiftTags(request: Request, { params }: Context) {
  const { source } = await params;
  const headers = { 'Cache-Control': 'no-store' };
  if (source !== 'qr' && source !== 'tap') {
    return new Response(null, { status: 404, headers });
  }

  const purpose = [request.headers.get('sec-purpose'), request.headers.get('purpose')].join(' ');
  if (request.method === 'GET' && !/prefetch|preview|prerender/i.test(purpose)) {
    try {
      const { error } = await supabaseAdmin().from('fair_link_opens').insert({ source });
      if (error) console.error('Could not record fair link open', error.code);
    } catch {
      console.error('Could not record fair link open');
    }
  }

  return new Response(null, { status: 302, headers: { ...headers, Location: '/tags' } });
}

export { openGiftTags as GET, openGiftTags as HEAD };
