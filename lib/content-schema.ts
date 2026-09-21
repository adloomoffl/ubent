import { z } from 'zod';
const short = z.string().trim().min(1).max(160);
const paragraph = z.string().trim().min(1).max(3000);
const image = z.string().trim().max(2000).refine(value => {
  if (/^\/media\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/.test(value)) return true;
  if (/^\/assets\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|avif)$/i.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}, 'Use an HTTPS image URL or a local /assets/ image path.');
const optionalLink = z.string().trim().max(2000).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}, 'Use an HTTPS link.');
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
const galleryItem = z.object({ id, title: short, category: short, image, alt: short }).strict();
const newsItem = z.object({ id, title: short, category: short, date: z.string().regex(/^\d{4}(-\d{2}-\d{2})?$/, 'Use a year or YYYY-MM-DD date.').refine(value => value.length === 4 || (!Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value), 'Use a valid calendar date.'), image, body: paragraph }).strict();
const unique = <T extends {id:string}>(items:T[]) => new Set(items.map(item => item.id)).size === items.length;
export const contentSchema = z.object({
  hero: z.object({ line1: short, line2: short, accent: short, subtitle: paragraph, image, imageAlt: short, imageNote: z.string().trim().max(200) }).strict(),
  about: z.object({ lead: paragraph, body: paragraph, image: image.optional(), founder: short.optional() }).strict(),
  services: z.array(z.object({ id, title: short, image, alt: short, description: paragraph, tags: short }).strict()).min(1).max(12).refine(unique, 'Services must have unique IDs.'),
  gallery: z.object({ description: paragraph, note: z.string().trim().max(500), items: z.array(galleryItem).max(30).refine(unique, 'Gallery items must have unique IDs.') }).strict(),
  news: z.array(newsItem).max(30).refine(unique, 'News items must have unique IDs.'),
  contact: z.object({ location: short, email: z.union([z.literal(''), z.email().max(254)]), phone: z.string().trim().max(30).regex(/^[+\d\s()\-]*$/, 'Use a phone number.'), whatsapp: z.string().trim().max(30).regex(/^[+\d\s()\-]*$/, 'Use a phone number.').optional().default(''), instagram: optionalLink, youtube: optionalLink }).strict(),
}).strict();
export type SiteContent = z.infer<typeof contentSchema>;
export const savedContentSchema = z.object({ revision: z.string().min(1).max(80), updatedAt: z.string().nullable(), content: contentSchema }).strict();
export type SavedContent = z.infer<typeof savedContentSchema>;
export const saveInputSchema = z.object({ revision: z.string().min(1).max(80), content: contentSchema }).strict();
