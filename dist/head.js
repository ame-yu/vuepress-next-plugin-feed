"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const utils_1 = require("@vuepress/utils");
const log_1 = __importDefault(require("./log"));
const utils_2 = __importDefault(require("./utils"));
/**
 * Class responsible for adding links to head
 */
class Head {
    constructor(options = {}, context) {
        var _a;
        if (!options.canonicalBase) {
            throw new Error("canonicalBase required");
        }
        this.options = options;
        this.canonicalBase = (_a = this.options.canonicalBase) !== null && _a !== void 0 ? _a : "";
        this.feeds = this.options.feeds || {};
        this._internal = this.options._internal || {};
        this.context = context || {};
    }
    get_feed_url(feed) {
        if (feed.head_link.enable && feed.enable && feed.fileName) {
            return utils_2.default.resolveUrl(this.canonicalBase, feed.fileName);
        }
    }
    // get_feed_url()
    /**
     * @return {array}
     */
    get_link_item(feed, site_title = "") {
        try {
            const href = this.get_feed_url(feed);
            if (!href) {
                return;
            }
            const { type, title } = feed.head_link;
            return [
                "link",
                {
                    rel: "alternate",
                    type,
                    href,
                    title: title.replace("%%site_title%%", site_title),
                },
            ];
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    // get_link_item()
    /**
     * @return {array|undefined}
     */
    async add_links() {
        try {
            if (lodash_1.isEmpty(this.feeds)) {
                return;
            }
            const siteConfig = this.context.siteData;
            siteConfig.head = siteConfig.head || [];
            const site_title = siteConfig.title || "";
            const out = [];
            for (const key in this.feeds) {
                if (!this._internal.allowed_feed_types.includes(key)) {
                    continue;
                }
                const item = this.get_link_item(this.feeds[key], site_title);
                if (lodash_1.isEmpty(item))
                    continue;
                siteConfig.head.push(item);
                log_1.default.success(`${key} link added to ${utils_1.chalk.cyan("siteConfig.head")}`);
                out.push(item);
            }
            return out;
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
}
exports.default = Head;
//# sourceMappingURL=head.js.map