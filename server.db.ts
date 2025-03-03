import { AmzProduct, BlogData, Log } from './server.models';
import { model, Schema } from 'mongoose';

const metricsSchema = new Schema({
    visits: Number
});
const Metrics = model('Metrics', metricsSchema, "metrics");

const configSchema = new Schema({
    adminLoginAttempts: Number
});
const Config = model('Config', configSchema, "config");

const visitsSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    year: Number,
    month: Number,
    day: Number,
    visits: Number
});
const Visits = model('Visits', visitsSchema, "visits");

const amzprodSchema = new Schema<AmzProduct>({
    asin: {
        type: String,
        unique: true,
    },
    link: String,
    largeImage: { height: Number, width: Number, url: String },
    mediumImage: { height: Number, width: Number, url: String },
    smallImage: { height: Number, width: Number, url: String },
    title: String,
    price: Number,
    displayPrice: String,
    isPrime: Boolean,
    lastUpdated: Date,
});
const AmzProd = model('AmzProd', amzprodSchema, "amz-prod");

const blogSchema = new Schema<BlogData>({
    title: String,
    path: String,
    description: String,
    imageName: String,
    imageFormat: String,
    imageAlt: String,
    articleDate: String,
    modifiedDate: String,
    article: { parts: [{tag: String, id: String, value: String, 
        product: { asin: {
            type: String,
            unique: true,
        },
        link: String,
        largeImage: { height: Number, width: Number, url: String },
        mediumImage: { height: Number, width: Number, url: String },
        smallImage: { height: Number, width: Number, url: String },
        title: String,
        price: Number,
        displayPrice: String,
        isPrime: Boolean,
        lastUpdated: Date,
    }}], html: String },
    published: Boolean,
    tags: [String]
});
const Blog = model('Blog', blogSchema, "blog");

const logsSchema = new Schema<Log>({
    date: {
        type: Date,
        default: Date.now,
        index: { expires: '90d' }, 
    },
    msg: String,
    asin: String,
});
const Logs = model('Logs', logsSchema, "logs");


export class GNookDb {

    constructor() {}

    public async incrementVisits(): Promise<void> {
        try {
            const updateDoc = {
                $inc: { visits: 1 }
            };

            await Metrics.findOneAndUpdate({}, updateDoc, { upsert: true });
        } catch (err) {
            throw err;
        }
    }

    public async incrementAdminLoginAttempts(): Promise<void> {
        try {
            const filter = {};
            const updateDoc = {
                $inc: { adminLoginAttempts: 1 }
            };

            await Config.findOneAndUpdate(filter, updateDoc);
        } catch (err) {
            throw err;
        }
    }

    public async getAdminLoginAttempts(): Promise<number | undefined> {
        try {
            const query = {};
            const options = { _id: 0, adminLoginAttempts: 1 };
            const config = await Config.findOne<{ adminLoginAttempts: number }>(query, options);
            return config?.adminLoginAttempts;
        } catch (err) {
            throw err;
        }
    }

    public async updateVisits(): Promise<void> {
        try {
            if(!Visits) return;
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            const day = today.getDate();

            const filter = { year: year, month: month, day: day};

            const doc = await Visits.exists(filter);
            if(!doc){
                await Visits.create({ year: year, month: month, day: day, visits: 1 });
            }
            else{
                const updateDoc = {
                    $inc: { visits: 1 }
                };
    
                await Visits.findByIdAndUpdate(doc._id, updateDoc);
            }
        } catch (err) {
            throw err;
        }
    }

    public async getBlogData(unpublishedOnly = false): Promise<BlogData[]> {
        try {
            if(!Blog) {
                return [];
            }
            const query = unpublishedOnly ? { published: false } : { };
            const blogData = await Blog.find<BlogData>(query);
            return blogData;
        } catch (err) {
            throw err;
        }
    }

    public async getBlogDataByPath(id: string): Promise<BlogData | undefined> {
        try {
            const query = { path: id };
            const options = { _id: 0 };
            const blogData = await Blog.findOne<BlogData>(query, options);
            return blogData ?? undefined;
        } catch (err) {
            throw err;
        }
    }

    public async saveBlogData(data: BlogData){
        try{
            const newBlog = await Blog.create(data);
            const result = await newBlog.save();
            return result?._id;
        } catch (ex) {
            console.dir(ex);
            return undefined;
        }
    }

    public async updateBlogData(data: BlogData){
        try{
            const updateDoc = {
                $set: {
                    title: data.title,
                    path: data.path,
                    description: data.description,
                    imageName: data.imageName,
                    imageFormat: data.imageFormat,
                    imageAlt: data.imageAlt,
                    articleDate: data.articleDate,
                    modifiedDate: data.modifiedDate,
                    tags: data.tags,
                    article: data.article,
                    published: data.published
                }
            };

            await Blog.findByIdAndUpdate(data._id, updateDoc);
        } catch (ex) {
            console.dir(ex);
            return undefined;
        }
    }

    public async saveLog(data: Log){
        try{
            const newLog = await new Logs(data);
            const result = await newLog.save();
            return result?._id;
        } catch (ex) {
            console.dir(ex);
            return undefined;
        }
    }

    //AMAZON PRODUCTS
    public async getCachedAmazonProducts(ids?: string[], asinsOnly?: boolean): Promise<Array<AmzProduct>> {
        try {
            const query = ids && ids?.length > 0 ? { asin: { $in: ids }} : {};
            const options = asinsOnly ? { asin: 1, _id: 0} : {};
            const prods = await AmzProd.find<AmzProduct>(query, options);
            return prods ?? [];
        } catch (err) {
            throw err;
        }
    }

    public async saveAmazonProduct(data: AmzProduct){
        try{
            const newProd = await AmzProd.create(data);
            const result = await newProd.save();
            return result?._id;
        } catch (ex) {
            console.dir(ex);
            return undefined;
        }
    }

    public async dailyAmazonCacheUpdate(data: AmzProduct){
        try{
            const query = { asin: data.asin };
            const updateDoc = {
                $set: {
                    link: data.link,
                    largeImage: data.largeImage,
                    mediumImage: data.mediumImage,
                    smallImage: data.smallImage,
                    title: data.title,
                    isPrime: data.isPrime,
                    lastUpdated: Date.now(),
                }
            };

            const result = await AmzProd.updateOne(query, updateDoc);
            return result?.matchedCount ?? 0;
        } catch (ex) {
            console.dir(ex);
            return undefined;
        }
    }
}