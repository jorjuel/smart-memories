import { isMaintenanceOwner } from '@/lib/siteMaintenance';
import { createSupabaseAdminAuthClient } from '@/lib/supabaseAdminAuthServer';

export const promotionPdfBucket = 'promotion-pdfs';
export const promotionPdfLimit = 4 * 1024 * 1024;

export const includedPromotionPdfs = [
  { name: 'Christmas Fair Display (A3)', file: 'Smart-Memories-Website-Style-Fair-Display-A3.pdf' },
  { name: 'Gift Tag Contact Slips (A4)', file: 'Smart-Memories-Contact-Slips-A4.pdf' },
];

export function isUploadedPromotionPdf(file: string) {
  return /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}_[a-z0-9_-]{1,100}\.pdf$/i.test(file);
}

export async function isPromotionPdfOwner() {
  const client = await createSupabaseAdminAuthClient();
  const { data: { user }, error } = await client.auth.getUser();
  return !error && isMaintenanceOwner(user?.email, process.env.ADMIN_EMAILS);
}
