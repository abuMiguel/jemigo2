import express from "express";
import { Router, Request, Response } from "express";
import { JemigoDb } from "./server.db";
import { AmzProduct, BlogData } from "./server.models";
import { Amazon } from "./server.external.api";
import { Util } from "./server.util";

export class Api {
  public router: Router;

  constructor(db: JemigoDb) {
    this.router = express.Router();
    this.setupAppRoutes(db);
    this.setupAmazonApiRoutes(db);
    this.setupBlogDataRoute(db);
  }

  setupAppRoutes(db: JemigoDb) {
    this.router.get("/incv", async function (req: Request, res: Response) {
      try {
        await db.incrementVisits();
        //await db.updateVisits();
        return res.sendStatus(204);
      } catch (e) {
        return res.status(500);
      }
    }
    );

    this.router.post("/access", async function (req: Request, res: Response) {
      try {
        if (process.env["NODE_ENV"] === 'production') {
          const attempts = await db.getAdminLoginAttempts();
          if (attempts && attempts > 8) {
            return res.sendStatus(500);
          }
        }

        if (req.body.token === process.env["ADMIN_PW"]) {
          return res.sendStatus(200);
        } else {
          db.incrementAdminLoginAttempts();
          return res.sendStatus(500);
        }
      } catch (e) {
        return res.sendStatus(500);
      }
    }
    );
  }

  setupBlogDataRoute(db: JemigoDb) {
    this.router.get("/blog/data", async function (req: Request, res: Response) {
      try {
        const blogData = await db.getBlogData();
        return res.json(blogData);
      } catch (e) {
        return res.status(500);
      }
    }
    );

    this.router.get("/blog/data/published", async function (req: Request, res: Response) {
      try {
        const blogData = await db.getPublishedBlogData();
        return res.json(blogData);
      } catch (e) {
        return res.status(500);
      }
    }
    );

    this.router.post("/blog/data/save", async function (req: Request, res: Response) {
      try {
        const blogData: BlogData = req.body.blogData;
        const blogId = await db.saveBlogData(blogData);

        try {
          const sitemapBuffer = await Util.updateSitemap(await db.getBlogData());
          await db.updateSitemap(sitemapBuffer);
        } catch (e) {
          console.error("Error updating sitemap:", e);
        }

        return res.status(200).send({ message: "Data saved: " + blogId });
      } catch (e) {
        return res.status(500);
      }
    }
    );

    this.router.post("/blog/data/update", async function (req: Request, res: Response) {
      try {
        const blogData: BlogData = req.body.blogData;
        await db.updateBlogData(blogData);

        try {
          const sitemapBuffer = await Util.updateSitemap(await db.getBlogData());
          await db.updateSitemap(sitemapBuffer);
        } catch (e) {
          console.error("Error updating sitemap:", e);
        }

        return res.status(200).send({ message: "Data updated." });
      } catch (e) {
        return res.status(500);
      }
    }
    );



    this.router.get("/blog/data/:id", async function (req: Request, res: Response) {
      try {
        const id = req.params["id"];
        const blogData: BlogData = await db.getBlogDataByPath(id);
        // Replace any Quill-inserted placeholders like [[AMZ:ASIN]] with
        // an `amz-product` component tag that carries the product data.
        // This allows the frontend/SSR to render the component in place.
        try {
          const html = blogData?.article?.html ?? '';
          if (html && /\[\[AMZ:([^\]]+)\]\]/i.test(html)) {
            // collect unique ASINs
            const matches = Array.from(html.matchAll(/\[\[AMZ:([^\]]+)\]\]/gi));
            const asins = [...new Set(matches.map(m => m[1]))];
            let prods: Array<AmzProduct> = [];
            if (asins.length > 0) {
              prods = await db.getCachedAmazonProducts(asins);
            }

            // Replace placeholders with component tags carrying serialized product data
            const replaced = html.replace(/\[\[AMZ:([^\]]+)\]\]/gi, (m, asin) => {
              const prod = prods.find(p => p.asin === asin);
              if (!prod) return '';
              // server-side render the product widget HTML
              return Util.getAmzProductLink(prod);
            });

            // assign back
            if (!blogData.article) blogData.article = { contents: undefined, html: replaced } as any;
            else blogData.article.html = replaced;
          }
        } catch (e) {
          console.error('Error replacing AMZ placeholders:', e);
        }
        return res.json(blogData);
      } catch (e) {
        return res.status(500);
      }
    }
    );
  }

  setupAmazonApiRoutes(db: JemigoDb) {
    this.router.post("/product/amz", async function (req: Request, res: Response) {
      try {
        const ids: Array<string> = req?.body?.ids;
        let prods: Array<AmzProduct> = [];

        //Get all products because no ids were specified
        if (!ids || ids?.length < 1) {
          prods = await db.getCachedAmazonProducts();
        }
        //Get only products for the ids that were requested
        else {
          prods = await db.getCachedAmazonProducts(req.body.ids);
        }

        return res.send(prods);
      } catch (e) {
        return res.status(500);
      }
    });

    //Limited to 10 or less at a time for now
    this.router.post("/product/amz/save", async function (req: Request, res: Response) {
      try {
        const ids: Array<string> = req?.body?.ids;
        if (!ids || ids?.length < 1) return res.status(500);

        let unavailableProds = 0;
        if (ids && ids.length <= 10) {
          const prods = await Amazon.getProducts(ids);
          prods.forEach(async (product) => {
            if (!product?.price && !product?.displayPrice && !product?.isPrime) {
              unavailableProds++;
              await db.saveLog({ date: new Date(), msg: `Product with ASIN: ${product.asin} is not available` });
            }
            else {
              await db.saveAmazonProduct(product);
            }
          });
        }

        return res.send({ msg: `saved with ${unavailableProds} products that are unavailable` });
      } catch (e) {
        await db.saveLog({ date: new Date(), msg: e });
        return res.status(500);
      }
    });
  }
}