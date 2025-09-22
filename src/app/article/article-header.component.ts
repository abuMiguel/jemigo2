import { Component, Input } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { AppData } from '../app.data';
import { ArticleShareComponent } from './article-share.component';

@Component({
  selector: 'article-header',
  templateUrl: './article-header.component.html',
  standalone: true,
  imports: [
    ArticleShareComponent,
    DatePipe,
    NgOptimizedImage,
  ],
})
export class ArticleHeaderComponent {
  @Input() data: AppData | undefined = undefined;

  // Build a progressive `srcset` for Cloudinary-hosted images by injecting
  // a width transformation into the `/upload/` segment. Example:
  // https://res.cloudinary.com/..../image/upload/v123/.../file.jpg
  // -> https://res.cloudinary.com/..../image/upload/w_800,c_limit,q_auto,f_auto/v123/.../file.jpg
  private buildCloudinaryUrlForWidth(url: string, width: number): string {
    if (!url) return url;
    const uploadSegment = '/upload/';
    const idx = url.indexOf(uploadSegment);
    if (idx === -1) return url; // not in expected form
    const before = url.slice(0, idx + uploadSegment.length);
    const after = url.slice(idx + uploadSegment.length);
    // Use quality auto and format auto for responsive delivery
    return `${before}w_${width},c_limit,q_auto,f_auto/${after}`;
  }

  get imageSrc(): string | undefined {
    const src = this.data?.image?.src;
    if (!src) return undefined;
    // prefer a reasonably sized default for src
    if (src.includes('cloudinary')) {
      return this.buildCloudinaryUrlForWidth(src, 640);
    }
    return src;
  }

  // Provide a width hint for NgOptimizedImage to reduce layout shift.
  get imageWidth(): number | undefined {
    const src = this.data?.image?.src;
    if (!src) return undefined;
    if (src.includes('cloudinary')) return 640;
    return undefined;
  }

  // Provide a height hint (assume 16:9 aspect ratio for header images unless
  // specific metadata is available). This helps avoid CLS when using explicit
  // dimensions with NgOptimizedImage.
  get imageHeight(): number | undefined {
    const w = this.imageWidth;
    if (!w) return undefined;
    // default to 16:9
    return Math.round((9 / 16) * w);
  }

  get imageSrcset(): string | undefined {
    const src = this.data?.image?.src;
    if (!src) return undefined;
    if (src.includes('cloudinary')) {
      const widths = [320, 480, 640, 768, 1024];
      const parts = widths.map(w => `${this.buildCloudinaryUrlForWidth(src, w)} ${w}w`);
      return parts.join(', ');
    }
    return undefined;
  }

  // Provide a sizes hint so the browser can pick appropriate src from srcset.
  // This assumes the header image is full-width within the page container.
  get imageSizes(): string {
    // 100vw up to 600px, 80vw for medium screens (601-900px), otherwise cap at 640px
    return '(max-width: 600px) 100vw, (max-width: 900px) 80vw, 640px';
  }
}
