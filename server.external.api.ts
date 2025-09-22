import {
  GetItemsPayload,
  GetItemsRequest,
  GetItemsResponse,
  Host,
  PartnerType,
  Region,
} from "paapi5-typescript-sdk";
import { AmzProduct } from "./server.models";

export abstract class Amazon {
  static async getProducts(ids: string[], partnerTag?: string): Promise<Array<AmzProduct>> {
    try {
      const requestParams: GetItemsPayload = {
        ItemIds: ids,
        ItemIdType: "ASIN",
        Condition: "New",
        Resources: [
          "Images.Primary.Large",
          "Images.Primary.Medium",
          "Images.Primary.Small",
          "ItemInfo.Title",
          "ItemInfo.Features",
          "Offers.Listings.Price",
          "Offers.Listings.DeliveryInfo.IsPrimeEligible",
        ],
      };

      // Choose partner tag: explicit argument wins, otherwise use first entry from env var (comma-separated)
      const envTags = (process.env["AMZ_PARTNER_TAG"] ?? "").split(',').map(t => t.trim()).filter(Boolean);
      const selectedTag = (partnerTag && String(partnerTag).trim()) || envTags[0] || "";

      const request = new GetItemsRequest(
        requestParams,
        selectedTag,
        PartnerType.ASSOCIATES,
        process.env["AMZ_ACCESS_KEY"] ?? "",
        process.env["AMZ_SECRET_KEY"] ?? "",
        Host.UNITED_STATES,
        Region.UNITED_STATES
      );

      const data: GetItemsResponse = await request.send();
      return this.mapGetItemsResponse(data);
    } catch (e) {
      throw e;
    }
  }

  protected static mapGetItemsResponse(items: GetItemsResponse): Array<AmzProduct> {
    try {
      const prods: Array<AmzProduct> = items?.ItemsResult.Items.map((item) => {
        const images = item?.Images?.Primary;
        const lg = images?.Large;
        const md = images?.Medium;
        const sm = images?.Small;

        const prod: AmzProduct = {
          asin: item.ASIN,
          link: item.DetailPageURL,
          title: item?.ItemInfo?.Title?.DisplayValue,
          features: item?.ItemInfo?.Features?.DisplayValues,
          price: item?.Offers?.Listings?.[0]?.Price?.Amount,
          displayPrice: item?.Offers?.Listings?.[0]?.Price?.DisplayAmount,
          isPrime: item?.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible,
        };

        if (lg) prod.largeImage = { height: +lg.Height, width: +lg.Width, url: lg.URL };
        if (md) prod.mediumImage = { height: +md.Height, width: +md.Width, url: md.URL };
        if (sm) prod.smallImage = { height: +sm.Height, width: +sm.Width, url: sm.URL };

        return prod;
      });

      return prods;
    } catch (e) {
      throw e;
    }
  }

  // static async getProductsTest(throwError = false): Promise<Array<AmzProduct>> {
  //   try {
  //     if(throwError) throw new Error("error on getProductTest");
  //     const item = {
  //       ASIN: "B08WT1DBDF",
  //       DetailPageURL:
  //         "https://www.amazon.com/dp/B08WT1DBDF?tag=jemigo00-20&linkCode=ogi&th=1&psc=1",
  //       Images: {
  //         Primary: {
  //           Large: {
  //             Height: 500,
  //             URL: "https://m.media-amazon.com/images/I/512Q5RBJqZL._SL500_.jpg",
  //             Width: 500,
  //           },
  //         },
  //       },
  //       ItemInfo: {
  //         Title: {
  //           DisplayValue:
  //             "MTN Dew Energy, Pomegranate Blue Burst,16oz Cans (12Pack)",
  //           Label: "Title",
  //           Locale: "en_US",
  //         },
  //       },
  //       Offers: {
  //         Listings: [
  //           {
  //             Id: "gy82%2BkKzmuk7lfH%2Bne9hS0P4ACYrG7Eg8N81sX0yg8hmzncjnW1wfn%2FjFoIBPEQtm9UD2Cs582%2BYR7LIpq6PegjPySp9%2BFx0CYT8bVZiMyi0TNMxITDezWZYKTQkidlI9Bp%2Bg3AKJmhKy%2BWlrnuV9Q%3D%3D",
  //             Price: {
  //               Amount: 22.99,
  //               Currency: "USD",
  //               DisplayAmount: "$22.99 ($0.12 / Fl Oz)",
  //               PricePerUnit: 0.12,
  //             },
  //             ViolatesMAP: false,
  //           },
  //         ],
  //       },
  //     };

  //     const items = [
  //       { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item },
  //       { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item },
  //       { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item }, { ...item },
  //       { ...item }, { ...item }, { ...item }, { ...item },
  //     ];

  //     const itemsResult = {
  //       ItemsResult: {
  //         Items: items,
  //       },
  //     };

  //     return Amazon.mapGetItemsResponse(itemsResult);
  //   }
  //   catch (e) {
  //     if(throwError) throw e;
  //   }
  // }
}
