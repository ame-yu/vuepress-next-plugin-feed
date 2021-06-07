"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const utils_1 = require("@vuepress/utils");
const log_1 = __importDefault(require("./log"));
const page_1 = __importDefault(require("./page"));
const feed_1 = require("feed");
/**
 * Class responsible for generating the feed xml/json files
 */
class Generator {
    /**
     * constructor
     *
     * @param {array} pages
     * @param {object} options
     * @param {object} context
     */
    constructor(pages, options, context) {
        var _a;
        if (lodash_1.isEmpty(pages)) {
            throw new Error("pages required");
        }
        if (!options.canonicalBase) {
            throw new Error("canonicalBase required");
        }
        this.pages = pages;
        this.options = options;
        this.canonicalBase = this.options.canonicalBase;
        this.feedOptions = (_a = this.options.feedOptions) !== null && _a !== void 0 ? _a : { id: "", copyright: "", title: "" };
        this.feeds = this.options.feeds || {};
        this._internal = this.options._internal || {};
        this.context = context || {};
        this.feed_generator = new feed_1.Feed(this.feedOptions);
    }
    // constructor()
    /**
     * @return null
     */
    async add_items() {
        var _a;
        try {
            if (!this.options)
                return;
            const pages = (_a = this.options) === null || _a === void 0 ? void 0 : _a.sort(this.pages).slice(0, this.options.count);
            log_1.default.info("Adding pages/posts as feed items...");
            const out = [];
            for (const page of pages) {
                const item = await new page_1.default(page, this.options, this.context).get_feed_item();
                if (!lodash_1.isEmpty(item)) {
                    this.feed_generator.addItem(item);
                    out.push(item);
                }
            }
            // -----------------------------------------------------------------------
            if (!lodash_1.isEmpty(out)) {
                log_1.default.success(`added ${utils_1.chalk.cyan(out.length + " page(s)")} as feed item(s)`);
            }
            // -----------------------------------------------------------------------
            return out;
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    // add_items()
    /**
     * @return null
     */
    add_categories() {
        var _a;
        try {
            const category = (_a = this.options) === null || _a === void 0 ? void 0 : _a.category;
            if (category) {
                const categories = Array.isArray(category) ? category : [category];
                categories.map((e) => this.feed_generator.addCategory(e));
            }
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    // add_categories()
    /**
     * @return null
     */
    add_contributors() {
        var _a;
        try {
            const contributor = (_a = this.options) === null || _a === void 0 ? void 0 : _a.contributor;
            if (contributor) {
                const contributors = Array.isArray(contributor)
                    ? contributor
                    : [contributor];
                contributors.map((e) => this.feed_generator.addContributor(e));
            }
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    // add_contributors()
    /**
     * @return {array}
     */
    async generate_files() {
        try {
            log_1.default.info("Checking feeds that need to be generated...");
            if (lodash_1.isEmpty(this.feeds)) {
                log_1.default.warn("no feeds set - aborting");
                return;
            }
            // const cwd = process.cwd()
            const { dest, base } = this.context.options;
            const out = [];
            for (const key in this.feeds) {
                if (!this._internal.allowed_feed_types.includes(key)) {
                    continue;
                }
                const feed = this.feeds[key];
                if (!feed.enable || !feed.fileName) {
                    continue;
                }
                const content = this.feed_generator[key]();
                const file = utils_1.path.resolve(dest, feed.fileName);
                const relative = utils_1.path.relative(base, file);
                await utils_1.fs.outputFile(file, content);
                log_1.default.success(`${key} feed file generated and saved to ${utils_1.chalk.cyan(relative)}`);
                out.push(file);
            }
            return out;
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    // generate_files()
    /**
     * @return {array}
     */
    async generate() {
        try {
            await this.add_items();
            this.add_categories();
            this.add_contributors();
            const files = await this.generate_files();
            return files;
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
}
exports.default = Generator;
//# sourceMappingURL=generator.js.map