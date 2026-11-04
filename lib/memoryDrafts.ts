import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { products } from '@/lib/products';

export type DraftDetails = {
  mode?: 'quick' | 'custom';
  designSource?: 'ours' | 'own';
  occasion?: string; size?: string; orientation?: string;
  template?: string; textLayout?: string;
  topText?: string; bottomText?: string; paragraph?: string;
  accessory?: string; recipient?: string; sender?: string;
  memoryMessage?: string;
};
export type MemoryDraft = {
  id: string; product_slug: string; title: string;
  step_index: number; details: DraftDetails;
  photo_path: string | null; audio_path: string | null;
  status: 'draft' | 'completed'; updated_at: string;
};
export const draftIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fields = ['mode','designSource','occasion','size','orientation','template',
 'textLayout','topText','bottomText','paragraph','accessory',
 'recipient','sender','memoryMessage'] as const;
export function sanitiseDraftDetails(input: unknown): DraftDetails {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const raw = input as Record<string,unknown>;
  const clean: Record<string,string> = {};
  for (const field of fields) {
    const value = raw[field];
    if (typeof value !== 'string') continue;
    clean[field] = value.slice(0, field === 'paragraph' || field === 'memoryMessage' ? 3000 : 300);
  }
  if (clean.mode && !['quick','custom'].includes(clean.mode)) delete clean.mode;
  if (clean.designSource && !['ours','own'].includes(clean.designSource)) delete clean.designSource;
  return clean as DraftDetails;
}
export function allowedDraftSlug(slug: string): boolean {
  return products.some(p => p.slug === slug);
}
export async function draftOwner() {
  const auth = await createSupabaseServerClient();
  const {data:{user},error} = await auth.auth.getUser();
  return error ? null : user;
}
export function getDraftAdmin() { return supabaseAdmin().from('memory_drafts'); }
export function draftStoragePathOwned(path: string, userId: string, draftId: string, kind: 'photo'|'audio'): boolean {
  const escapedUser = userId.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&');
  const escapedDraft = draftId.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&');
  return new RegExp('^'+escapedUser+'/'+escapedDraft+'/'+kind+'-[a-f0-9-]{36}\\.(?:jpg|png|webp|heic|webm|m4a|mp3|ogg|wav)$','i').test(path);
}
