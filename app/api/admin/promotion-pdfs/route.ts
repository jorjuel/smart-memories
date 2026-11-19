import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { boundedBody } from '@/lib/catalogueImageServer';
import { includedPromotionPdfs, isPromotionPdfOwner, isUploadedPromotionPdf, promotionPdfBucket, promotionPdfLimit } from '@/lib/promotionPdfs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function back(status: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: `/admin/promotion-pdfs?status=${status}`, 'Cache-Control': 'no-store' },
  });
}

export async function GET(request: Request) {
  if (!(await isPromotionPdfOwner())) return new Response(null, { status: 403 });

  const file = new URL(request.url).searchParams.get('file') ?? '';
  const included = includedPromotionPdfs.some((item) => item.file === file);
  if (!included && !isUploadedPromotionPdf(file)) {
    return new Response(null, { status: 404 });
  }

  let content: Uint8Array<ArrayBuffer> | Blob | null = included
    ? await readFile(join(process.cwd(), 'private', 'promotion-pdfs', file))
        .catch((error: NodeJS.ErrnoException) => {
          if (error.code !== 'ENOENT') throw error;
          return null;
        })
    : null;
  if (!content) {
    const { data, error } = await supabaseAdmin().storage.from(promotionPdfBucket).download(file);
    if (error || !data) return new Response(null, { status: 404 });
    content = data;
  }
  const downloadName = included ? file : file.slice(37);

  return new Response(content, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin || !(await isPromotionPdfOwner())) {
    return new Response(null, { status: 403 });
  }
  const body = await boundedBody(request, promotionPdfLimit + 16 * 1024);
  if (!body) return back('too-large');
  const form = await body.formData().catch(() => null);
  const file = form?.get('pdf');
  if (!(file instanceof File) || !/\.pdf$/i.test(file.name)) return back('invalid');
  if (file.size > promotionPdfLimit) return back('too-large');
  if (await file.slice(0, 5).text() !== '%PDF-') return back('invalid');

  const title = file.name.slice(0, -4).replace(/[^a-z0-9_-]+/gi, '-').slice(0, 100) || 'promotion';
  const name = `${crypto.randomUUID()}_${title}.pdf`;
  try {
    const { error } = await supabaseAdmin().storage.from(promotionPdfBucket)
      .upload(name, file, { contentType: 'application/pdf', upsert: false });
    return back(error ? 'unavailable' : 'saved');
  } catch {
    return back('unavailable');
  }
}
