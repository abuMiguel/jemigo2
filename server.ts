import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import bootstrap from './src/main.server';
import helmet from 'helmet';
import compression from 'compression';
import { JemigoDb } from './server.db';
import cors from 'cors';
import { Api } from './server.api';
import 'dotenv/config';
//import 'zone.js';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import mongoose from 'mongoose';
import robots from 'express-robots-txt'

import { Scheduler } from './server.scheduler';
import { Util } from './server.util';

// The Express app is exported so that it can be used by serverless Functions.
export async function app(): Promise<express.Express> {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, "../browser");
  const indexHtml = join(serverDistFolder, "index.server.html");

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.set('trust proxy', true);
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", "https://www.google-analytics.com"],
        scriptSrc: ["'self'", process.env["SITE_NAME"], "https://*.googletagmanager.com", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        imgSrc: ["'self'", "https: data:", process.env["SITE_NAME"]],
        styleSrc: ["'self'", "'unsafe-inline'", process.env["ROOT_URL"]],
        fontSrc: ["'self'"],
        mediaSrc: ["'self'"],
        frameSrc: ["https://www.youtube-nocookie.com"]
      }
    }));
  server.use(compression());

  await mongoose.connect(process.env["MONGODB_URI"]);

  const schedulerOn = process.env["NODE_ENV"] === 'production' && !process.env["ROOT_URL"].includes("localhost");

  const db = new JemigoDb();

  if (schedulerOn) {
    new Scheduler(db).init();
  }

  server.disable('x-powered-by');

  server.use(cors({
    origin: [
      process.env['ROOT_URL'] ?? 'http://localhost:4200'
    ],
    credentials: true,
  }));

  server.use(
    robots({
      UserAgent: "*",
      Disallow: "",
      Sitemap: process.env["ROOT_URL"] + '/sitemap.xml'
    },
      {
        UserAgent: 'GPTBot',
        Disallow: '/'
      },
      {
        UserAgent: "*",
        Disallow: "/admin"
      },
      {
        UserAgent: "*",
        Disallow: "/api"
      })
  );

  const apiServer = new Api(db).router;

  // Example Express Rest API endpoints
  server.use('/api', apiServer);

  // Serve sitemap.xml as gzip
  server.get('/sitemap.xml', async (req, res) => {
    try {
      // Use cached buffer if available
      let sitemapBuffer = Util.getCachedSitemapBuffer();
      if (!sitemapBuffer) {
        // Retrieve from DB and cache it
        const sitemapDoc = await db.getSitemap();
        if (!sitemapDoc || !sitemapDoc.content) {
          res.status(404).send('Sitemap not found');
          return;
        }
        sitemapBuffer = sitemapDoc.content;
        Util.setCachedSitemapBuffer(sitemapBuffer);
      }
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', 'inline; filename="sitemap.xml.gz"');
      res.send(sitemapBuffer);
    } catch (err) {
      res.status(500).send('Error retrieving sitemap');
    }
  });

  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

async function run(): Promise<void> {
  const port = process.env["PORT"] || 4000;

  // Start up the Node server
  const server = await app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

(async () => {
  await run();
})();
