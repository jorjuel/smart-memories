import { redirect } from 'next/navigation';
import { includedPromotionPdfs, isPromotionPdfOwner, isUploadedPromotionPdf, promotionPdfBucket } from '@/lib/promotionPdfs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const messages = {
  saved: 'PDF saved.',
  invalid: 'Choose a valid PDF file.',
  'too-large': 'Choose a PDF up to 4 MB.',
  unavailable: 'Could not save the PDF. Check that private PDF storage is configured.',
};

function downloadUrl(file: string) {
  return `/api/admin/promotion-pdfs?file=${encodeURIComponent(file)}`;
}

export default async function PromotionPdfsPage({ searchParams }: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!(await isPromotionPdfOwner())) redirect('/admin/login');
  const { status } = await searchParams;
  const message = status && Object.hasOwn(messages, status) ? messages[status as keyof typeof messages] : undefined;
  const uploaded: string[] = [];
  let available = true;
  try {
    const bucket = supabaseAdmin().storage.from(promotionPdfBucket);
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await bucket.list('', { limit: 100, offset, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      uploaded.push(...data.map(({ name }) => name).filter(isUploadedPromotionPdf));
      if (data.length < 100) break;
    }
  } catch {
    available = false;
  }

  return (
    <section className="wrap">
      <h1>Promotion PDFs</h1>
      <p>Keep your signs, contact slips and other promotional PDFs together.</p>
      <div className="card">
        <h2>Fair printouts</h2>
        <ul>
          {includedPromotionPdfs.map(({ name, file }) => (
            <li key={file}><a href={downloadUrl(file)}>{name} · Download PDF</a></li>
          ))}
        </ul>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h2>Uploaded PDFs</h2>
        {message && <p role="status">{message}</p>}
        {uploaded.length > 0 && (
          <ul>
            {uploaded.map((file) => <li key={file}><a href={downloadUrl(file)}>{file.slice(37)}</a></li>)}
          </ul>
        )}
        {available ? (
          <form action="/api/admin/promotion-pdfs" method="POST" encType="multipart/form-data">
            <p><label htmlFor="promotion-pdf">Choose a PDF up to 4 MB</label></p>
            <input id="promotion-pdf" name="pdf" type="file" accept=".pdf,application/pdf" required />
            <button className="btn small" type="submit">Save PDF</button>
          </form>
        ) : <p>Uploads are unavailable until private PDF storage is configured.</p>}
      </div>
    </section>
  );
}
