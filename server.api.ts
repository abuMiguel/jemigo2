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
      } catch {
        return res.sendStatus(500);
      }
    }
    );

    this.router.post("/access", async function (req: Request, res: Response) {
      try {
        // Protect against brute-force in production
        if (process.env["NODE_ENV"] === 'production') {
          const attempts = await db.getAdminLoginAttempts();
          if (attempts && attempts > 8) {
            return res.sendStatus(500);
          }
        }

        const token = req.body?.token;
        const user = (req.body?.user ?? '').toString().trim();

        // Require both token and user
        if (!token || !user) {
          try { db.incrementAdminLoginAttempts(); } catch {}
          return res.sendStatus(500);
        }

        // Validate user against configured AMZ partner tags (comma-separated)
        const envTags = (process.env["AMZ_PARTNER_TAG"] ?? "").split(',').map(t => t.trim()).filter(Boolean);
        const userAllowed = envTags.includes(user);
        if (!userAllowed) {
          try { db.incrementAdminLoginAttempts(); } catch {}
          return res.sendStatus(500);
        }

        // Validate admin token
        if (token === process.env["ADMIN_PW"]) {
          return res.sendStatus(200);
        } else {
          try { db.incrementAdminLoginAttempts(); } catch {}
          return res.sendStatus(500);
        }
      } catch {
        return res.sendStatus(500);
      }
    }
    );

    // Return configured AMZ partner tags parsed from environment (comma-separated)
    this.router.get("/admin/partnertags", async function (req: Request, res: Response) {
      try {
        const envTags = (process.env["AMZ_PARTNER_TAG"] ?? "").split(',').map(t => t.trim()).filter(Boolean);
        return res.json(envTags);
      } catch {
        return res.sendStatus(500);
      }
    });
  }

  setupBlogDataRoute(db: JemigoDb) {
    this.router.get("/blog/data", async function (req: Request, res: Response) {
      try {
        const blogData = await db.getBlogData();
        return res.json(blogData);
      } catch {
        return res.sendStatus(500);
      }
    }
    );

    this.router.get("/blog/data/published", async function (req: Request, res: Response) {
      try {
        const blogData = await db.getPublishedBlogData();
        return res.json(blogData);
      } catch {
        return res.sendStatus(500);
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
      } catch {
        return res.sendStatus(500);
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
      } catch {
        return res.sendStatus(500);
      }
    }
    );

    this.router.get("/blog/data/:id", async function (req: Request, res: Response) {
      try {
        const id = req.params["id"];
        const blogData: BlogData = await db.getBlogDataByPath(id);
        // Do not perform AMZ placeholder replacement on the server anymore.
        // The frontend (editor) will render affiliate HTML so authors see it in Quill.
        return res.json(blogData);
      } catch {
        return res.sendStatus(500);
      }
    });
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
      } catch {
        return res.sendStatus(500);
      }
    });

    //Limited to 10 or less at a time for now
    this.router.post("/product/amz/save", async function (req: Request, res: Response) {
      try {
        const ids: Array<string> = req?.body?.ids;
        const partnerTag = req?.body?.partnerTag;
        if (!ids || ids?.length < 1) return res.status(500);

        let unavailableProds = 0;
        if (ids && ids.length <= 10) {
          const prods = await Amazon.getProducts(ids, partnerTag);
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
        await db.saveLog({ date: new Date(), msg: String(e) });
        return res.sendStatus(500);
      }
    });
  }
}