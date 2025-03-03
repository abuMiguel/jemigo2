import { AmzProduct, BlogData, Ele } from "./server.models";

export class Util {

    static articleToHtml(ar: BlogData, prods: Array<AmzProduct>): string{
        let article = "<section>";
        ar.article.parts.forEach((el: Ele, i: number) => {
          if(i < 1) return;
          switch(el.tag){
            case "p":
              article += `<p>${el?.value}</p>`;
              break;
            case "h2":
              article += `<h2${el?.id ? " id='" + el?.id + "'" : ""}>${el?.value}</h2>`;
              break;
            case "link":
              const prod: AmzProduct | undefined = prods.find(p => p.asin === el?.id);
              article += this.getAmzProductLink(prod);
              break;
            case "contents":
              article += this.getPageContents(ar);
              break;
            default: return;
          }
        });
        article += "</section>";
        return article;
      }

      static getAmzProductLink(prod: AmzProduct | undefined){
        if(!prod) return "";

        const offsetSm = 225;
        const offsetMd = 150;
        const offsetLg = 100;
        const image = prod.largeImage;

        return `<section class="center images-section">
          <a href="${prod?.link}" target="_blank">
          <img srcset="${image?.url} ${image?.width}w" 
            sizes="(max-width: 600px) ${(image?.width ?? 600) - offsetSm}px, 
            ((min-width: 600px) and (max-width: 817px)) ${(image?.width ?? 700) - offsetMd}px, 
            (min-width: 817px) ${(image?.width ?? 818) - offsetLg}px"
            src="${image?.url}"
            alt="${prod?.title}"
          >
          </a>
          <button class="prod-btn"><a href="${prod?.link}" target="_blank">View on Amazon</a></button>
          </section>`;
      }
    
      static getPageContents(ar: BlogData){
        let pageContents = `
        <section class="page-contents">
        <p class="mb-0"><strong>Page Contents:</strong></p>
        <ul class="mt-0 page-contents-list">`;
    
        ar.article.parts.forEach((el) => {
          if(el.tag === "h2"){
            pageContents += `<li><a href="blog/${ar.path}#${el?.id}">${el?.value}</a></li>`;
          }
        });
    
        pageContents += `</ul></section>`;
        return pageContents;
      }
  
  }