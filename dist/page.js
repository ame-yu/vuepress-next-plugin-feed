"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const log_1 = __importDefault(require("./log"));
const utils_1 = __importDefault(require("./utils"));
const core_1 = require("@vuepress/core");
//https://github.com/vuepress/vuepress-next/discussions/43
/**
 * Class responsible for preparing a page data to be used as feed item
 */
class Page {
    constructor($page, options = {}, context) {
        var _a, _b, _c;
        if (!options.canonicalBase) {
            throw new Error("canonicalBase required");
        }
        const { path, pathInferred } = $page;
        this.path = path !== null && path !== void 0 ? path : pathInferred;
        if (!this.path) {
            throw new Error("path required");
        }
        // -------------------------------------------------------------------------
        const { key, // page's unique hash key
        frontmatter, // page's frontmatter object
        excerpt, content, } = $page;
        const _strippedContent = core_1.resolvePageContent({
            contentRaw: content,
        }).content;
        this.$page = $page;
        this.key = key;
        this.frontmatter = frontmatter !== null && frontmatter !== void 0 ? frontmatter : {};
        this.feed_settings = (_b = (_a = this.frontmatter) === null || _a === void 0 ? void 0 : _a.feed) !== null && _b !== void 0 ? _b : {};
        this.excerpt = excerpt;
        this._strippedContent = _strippedContent;
        this.options = options;
        this.canonicalBase = this.options.canonicalBase;
        this.feedOptions = (_c = this.options.feedOptions) !== null && _c !== void 0 ? _c : {};
        this.context = context || {};
    }
    // constructor()
    url_resolve(path) {
        if (this.canonicalBase && path) {
            return utils_1.default.resolveUrl(this.canonicalBase, path);
        }
    }
    extract_from_stripped_content(reg, flag) {
        if (!this._strippedContent) {
            return;
        }
        const regex = new RegExp(reg, flag);
        if (!(regex instanceof RegExp)) {
            return;
        }
        let match;
        if ((match = regex.exec(this._strippedContent)) !== null) {
            if (match[1]) {
                return match[1];
            }
        }
    }
    get_feed_setting(key, fallback = true) {
        try {
            if (this.feed_settings.hasOwnProperty(key)) {
                return this.feed_settings[key];
            }
            // -----------------------------------------------------------------------
            if (fallback && !lodash_1.isEmpty(this.feedOptions[key])) {
                return this.feedOptions[key];
            }
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    // get_feed_setting()
    /**
     * @return {string}
     */
    get title() {
        const { title } = this.$page;
        return this.feed_settings.title || title;
    }
    // get title()
    /**
     * @return {Date}
     */
    get date() {
        const { date } = this.$page;
        return date && !date.startsWith("0") ? new Date(date) : new Date();
    }
    // get date()
    /**
     * @return {string}
     */
    get url() {
        return this.url_resolve(this.path);
    }
    // get url()
    /**
     * @return {string}
     */
    get description() {
        var _a, _b, _c;
        try {
            if (this.feed_settings.hasOwnProperty("description")) {
                return this.feed_settings.description;
            }
            if (lodash_1.isEmpty(this.options.description_sources)) {
                return;
            }
            let out = "";
            for (const source of (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.description_sources) !== null && _b !== void 0 ? _b : []) {
                switch (source) {
                    case "frontmatter":
                        out = this.frontmatter.description || "";
                        break;
                    case "excerpt":
                        out = this.excerpt || "";
                        break;
                    default:
                        // content without frontmatter - used with regex
                        out = (_c = this.extract_from_stripped_content(source)) !== null && _c !== void 0 ? _c : "";
                        break;
                }
                if (!out) {
                    continue;
                }
                out = utils_1.default.stripMarkup(out.trim());
                if (out) {
                    break;
                }
            }
            return out;
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    /**
     * @wip
     * @return {string}
     */
    get content() {
        try {
            if (this.feed_settings.hasOwnProperty("content")) {
                return this.feed_settings.content;
            }
            // -----------------------------------------------------------------------
            if (lodash_1.isEmpty(this.context.markdown)) {
                return;
            }
            // @todo: should be generated html from markdown
            if (this._strippedContent) {
                const { html } = this.context.markdown.render(this._strippedContent);
                // ---------------------------------------------------------------------
                if (!html) {
                    return;
                }
                return html;
            }
            // @consider falling back to excerpt or description
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    /**
     * @return {string} image url
     */
    get image() {
        var _a, _b, _c, _d;
        try {
            if (this.feed_settings.hasOwnProperty("image")) {
                return this.feed_settings.image;
            }
            if (lodash_1.isEmpty(this.options.image_sources)) {
                return;
            }
            let out = "";
            for (const source of (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.image_sources) !== null && _b !== void 0 ? _b : []) {
                switch (source) {
                    case "frontmatter":
                        out = (_c = this.frontmatter.image) !== null && _c !== void 0 ? _c : "";
                        break;
                    default:
                        // content without frontmatter - used with regex
                        out = (_d = this.extract_from_stripped_content(source)) !== null && _d !== void 0 ? _d : "";
                        break;
                }
                if (out) {
                    out = out.trim();
                    break;
                }
            }
            if (!out) {
                return;
            }
            return utils_1.default.isUrl(out) ? out : this.url_resolve(out);
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
    get author() {
        return this.get_feed_setting("author");
    }
    get contributor() {
        return this.get_feed_setting("contributor");
    }
    /**
     * @return {object}
     */
    async get_feed_item() {
        try {
            // we need at least title or description
            const title = this.title;
            const description = this.description;
            if (!title && !description) {
                return;
            }
            // -----------------------------------------------------------------------
            const url = this.url;
            const out = {
                title,
                description,
                id: url,
                link: url,
                date: this.date,
                image: this.image,
                author: [],
                contributor: [],
                // @todo:
                // all content is included in item
                // still a wip; needs rendering all vue related syntax
                //content: this.content,
                // @notes: the following are handled below
                /*
                        author			: [],
                        contributor	: [],
                        */
            };
            // const keys:Array<> = ['author', 'contributor'];
            const keys = ["author", "contributor"];
            //   const keys = (<T extends string[]>(...o: T) => o)("author", "contributor")
            for (const key of keys) {
                const res = this[key];
                if (!lodash_1.isEmpty(res)) {
                    out[key] = Array.isArray(res) ? res : [res];
                }
            }
            return out;
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    }
}
exports.default = Page;
//# sourceMappingURL=page.js.map