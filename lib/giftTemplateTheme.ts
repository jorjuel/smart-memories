/**
 * Visual design families for the live product preview.
 * These are UI previews; the selected template name is also stored with
 * the order for final artwork production.
 */
export type GiftTemplateTheme =
  | 'floral'
  | 'celebration'
  | 'wedding'
  | 'memorial'
  | 'pet'
  | 'festive'
  | 'elegant'
  | 'modern'
  | 'family'
  | 'classic';

export function getGiftTemplateTheme(template?: string | null): GiftTemplateTheme {
  const value = (template || '').toLowerCase();
  if (/floral|rose|flower|garden/.test(value)) return 'floral';
  if (/birthday|graduation|retirement|leaving/.test(value)) return 'celebration';
  if (/wedding|anniversary|romance|love/.test(value)) return 'wedding';
  if (/memorial|remembrance|tribute/.test(value)) return 'memorial';
  if (/pet|paw/.test(value)) return 'pet';
  if (/christmas|festive|holiday/.test(value)) return 'festive';
  if (/elegant|border|classic/.test(value)) return 'elegant';
  if (/modern|minimal|clean|full photo|photo classic/.test(value)) return 'modern';
  if (/family|baby|teacher|work/.test(value)) return 'family';
  return 'classic';
}
