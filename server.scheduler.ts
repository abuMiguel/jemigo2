import { GNookDb } from "./server.db";

import schedule from "node-schedule";
import { AmzProduct } from "./server.models";
import { Amazon } from "./server.external.api";

export class Scheduler {
  //every day at 2am EST (GMT is about 5 hours off)
  private rule2am = "0 0 7 * * *";
  //every 45 seconds
  private ruleTest = "*/45 * * * * *";
  private testing = false;

  constructor(private db: GNookDb) { }

  init() {
    //Test rule
    if (this.testing) {
      console.log("test started");
      schedule.scheduleJob(this.ruleTest, async () => await this.dailyJobs());
    }
    else {
      schedule.scheduleJob(this.rule2am, async () => await this.dailyJobs());
    }
  }

  async dailyJobs() {
    await this.refreshAmazonProductCache();
  }

  async refreshAmazonProductCache() {
    this.db.saveLog({ date: new Date(), msg: "Amazon product cache update started" });

    const updates: Array<AmzProduct> = [];
    let updateParam: Array<string> = [];

    try {
      const cachedProds = await this.db.getCachedAmazonProducts([], true);
      let asins = cachedProds.map((p) => p.asin);

      let errorCount = 0;
      const retryCount = 0;

      // Retry retryCount times if error. Get items in batches of 10 or less.
      while (asins && asins.length > 0 && errorCount <= retryCount) {
        try {
          if (asins && asins.length > 10) {
            updateParam = asins.splice(0, 10);
          } else {
            updateParam = asins;
            asins = [];
          }

          const prods = await Amazon.getProducts(updateParam);
          await this.sleep(2000);
          if (prods) updates.push(...prods);
        } catch (e: unknown) {
          await this.db.saveLog({ date: new Date(), msg: e as string });
          await this.sleep(2000);
          errorCount++;
          asins.push(...updateParam);
          console.error(e);
          continue;
        }
      }

      updates.forEach(async (updatedProd) => {
        await this.db.dailyAmazonCacheUpdate(updatedProd);
      });
      await this.db.saveLog({ date: new Date(), msg: "Amazon products cache updated" });
    }
    catch (e: unknown) {
      await this.db.saveLog({ date: new Date(), msg: e as string });
      console.error(e);
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
