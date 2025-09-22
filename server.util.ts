import { AmzProduct, BlogData } from "./server.models";
import { Readable } from "stream";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";

export class Util {
  private static sitemapBufferCache: Buffer | undefined;

  // static articleToHtml(ar: BlogData, prods: Array<AmzProduct>): string {
  //   let article = "<section>";
  //   ar.article.parts.forEach((el: Ele, i: number) => {
  //     if (i < 1) return;
  //     switch (el.tag) {
  //       case "p":
  //         article += `<p>${el?.value}</p>`;
  //         break;
  //       case "h2":
  //         article += `<h2${el?.id ? " id='" + el?.id + "'" : ""}>${el?.value}</h2>`;
  //         break;
  //       case "link":
  //         const prod: AmzProduct | undefined = prods.find(p => p.asin === el?.id);
  //         article += this.getAmzProductLink(prod);
  //         break;
  //       case "contents":
  //         article += this.getPageContents(ar);
  //         break;
  //       default: return;
  //     }
  //   });
  //   article += "</section>";
  //   return article;
  // }

  static getAmzProductLink(prod: AmzProduct | undefined): string {
    if (!prod) return "";

    // Simple HTML escaper for attribute values and text nodes
    const esc = (s?: string) => {
      if (!s) return "";
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    const offsetSm = 225;
    const offsetMd = 150;
    const offsetLg = 100;
    const image = prod.largeImage;

    const safeLink = esc(prod.link);
    const safeTitle = esc(prod.title);
    const imgUrl = image?.url ? esc(image.url) : "";
    const imgWidth = typeof image?.width === 'number' ? image.width : undefined;

    // Build srcset only when we have a valid image url and width
    const srcset = imgUrl && imgWidth ? `${imgUrl} ${imgWidth}w` : "";

    // Calculate fallback sizes safely
    const sizeSm = (imgWidth ?? 600) - offsetSm;
    const sizeMd = (imgWidth ?? 700) - offsetMd;
    const sizeLg = (imgWidth ?? 818) - offsetLg;

    // Use an anchor styled as a button instead of nesting <a> inside <button>
  const viewButton = `<a class="prod-btn" href="${safeLink}" target="_blank" rel="noopener noreferrer">View on Amazon <span class="prod-arrow" aria-hidden="true">→</span></a>`;

    // If no image is available, return a simple linked title + button
    if (!imgUrl) {
      return `<section class="center images-section">
        <a href="${safeLink}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>
        ${viewButton}
      </section>`;
    }

    return `<section class="center images-section">
          <a href="${safeLink}" target="_blank" rel="noopener noreferrer">
            <img srcset="${srcset}"
              sizes="(max-width: 600px) ${sizeSm}px, ((min-width: 600px) and (max-width: 817px)) ${sizeMd}px, (min-width: 817px) ${sizeLg}px"
              src="${imgUrl}"
              alt="${safeTitle}"
            >
          </a>
          ${viewButton}
          </section>`;
  }

  // static getPageContents(ar: BlogData) {
  //   let pageContents = `
  //       <section class="page-contents">
  //       <p class="mb-0"><strong>Page Contents:</strong></p>
  //       <ul class="mt-0 page-contents-list">`;

  //   ar.article.parts.forEach((el) => {
  //     if (el.tag === "h2") {
  //       pageContents += `<li><a href="blog/${ar.path}#${el?.id}">${el?.value}</a></li>`;
  //     }
  //   });

  //   pageContents += `</ul></section>`;
  //   return pageContents;
  // }

  static async updateSitemap(blogData: BlogData[]): Promise<Buffer | undefined> {
    try {
      const links = blogData.map(blogPost => ({
        url: `/blog/${blogPost.path}`,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: blogPost.modifiedDate
      }));

      links.push(
        { url: '/', changefreq: 'monthly', priority: 1.0, lastmod: '2024-07-07' },
        { url: '/about', changefreq: 'monthly', priority: 0.5, lastmod: '2024-07-07' },
        { url: '/reviews', changefreq: 'monthly', priority: 0.5, lastmod: '2024-07-07' },
        { url: '/reviews/best-energy-drinks', changefreq: 'monthly', priority: 0.5, lastmod: '2024-07-07' },
        { url: '/cable-management-guide', changefreq: 'monthly', priority: 0.5, lastmod: '2022-07-13T13:00:00+00:00' },
        { url: '/wfh-tools', changefreq: 'monthly', priority: 0.5, lastmod: '2022-07-24' },
        { url: '/wfh-tools/percent-change-calculator', changefreq: 'monthly', priority: 0.5, lastmod: '2022-07-24' },
        { url: '/wfh-tools/wfh-time-savings-calculator', changefreq: 'monthly', priority: 0.5, lastmod: '2022-07-24' },
        { url: '/wfh-guide', changefreq: 'monthly', priority: 0.5, lastmod: '2025-02-25' },
        { url: '/wfh-guide/reasons-to-work-from-home', changefreq: 'monthly', priority: 0.5, lastmod: '2022-06-16T20:00:00+00:00' },
        { url: '/wfh-guide/take-control', changefreq: 'monthly', priority: 0.5, lastmod: '2022-10-11T17:00:00+00:00' },
        { url: '/blog', changefreq: 'monthly', priority: 0.5, lastmod: '2024-07-07' },
        { url: '/blog/successful-mindset', changefreq: 'monthly', priority: 0.5, lastmod: '2022-04-24T16:04:00+00:00' },
      );

      const sitemapStream = new SitemapStream({ hostname: 'https://www.jemigo.com/' });
      const gzipStream = sitemapStream.pipe(createGzip());
      const sitemapPromise = streamToPromise(gzipStream);
      Readable.from(links).pipe(sitemapStream);
      const sitemapBuffer = await sitemapPromise;

      // Update cache
      Util.sitemapBufferCache = sitemapBuffer;

      return sitemapBuffer;
    } catch(error) {
      console.error('Error updating sitemap:', error);
      return undefined;
    }
  }

  static getCachedSitemapBuffer(): Buffer | undefined {
    return Util.sitemapBufferCache;
  }

  static setCachedSitemapBuffer(buffer: Buffer) {
    Util.sitemapBufferCache = buffer;
  }
}