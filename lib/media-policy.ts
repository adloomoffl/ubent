import type { SiteContent } from './content-schema.ts';

export function isPublishedImage(content: SiteContent, url: string): boolean {
  return [content.hero.image, content.about.image,
    ...content.services.map(item => item.image),
    ...content.gallery.items.map(item => item.image),
    ...content.news.map(item => item.image),
  ].includes(url);
}
