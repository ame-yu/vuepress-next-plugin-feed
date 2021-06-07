"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const log_1 = __importDefault(require("./log"));
const utils_1 = __importDefault(require("./utils"));
const generator_1 = __importDefault(require("./generator"));
const head_1 = __importDefault(require("./head"));
const pluginName = "vuepress-next-plugin-feed";
const homepage = "https://github.com/ame-yu/vuepress-next-plugin-feed";
/**
 * holds relevant functions and data
 */
const PLUGIN = {
    name: pluginName,
    homepage,
    key: pluginName.replace("vuepress-next-plugin-", ""),
    allowed_feed_types: ["rss2", "atom1", "json1"],
    pages: [],
    options: {},
};
PLUGIN.get_options_defaults = (context) => {
    const { title, description } = context.siteData;
    // Feed class options
    // @see: https://github.com/jpmonette/feed#example
    const feedOptions = {
        title,
        description,
        generator: PLUGIN.homepage,
    };
    // ---------------------------------------------------------------------------
    const out = {
        // required; it can also be used as enable/disable
        canonicalBase: "",
        feedOptions,
        feeds: {
            rss2: {
                enable: true,
                fileName: "rss.xml",
                head_link: {
                    enable: true,
                    type: "application/rss+xml",
                    title: "%%site_title%% RSS Feed",
                },
            },
            atom1: {
                enable: true,
                fileName: "feed.atom",
                head_link: {
                    enable: true,
                    type: "application/atom+xml",
                    title: "%%site_title%% Atom Feed",
                },
            },
            json1: {
                enable: true,
                fileName: "feed.json",
                head_link: {
                    enable: true,
                    type: "application/json",
                    title: "%%site_title%% JSON Feed",
                },
            },
        },
        // -------------------------------------------------------------------------
        // order of what gets the highest priority:
        //
        // 1. frontmatter
        // 2. page excerpt
        // 3. content markdown paragraph
        // 4. content regular html <p>
        description_sources: [
            "frontmatter",
            "excerpt",
            /^((?:(?!^#)(?!^\-|\+)(?!^[0-9]+\.)(?!^!\[.*?\]\((.*?)\))(?!^\[\[.*?\]\])(?!^\{\{.*?\}\})[^\n]|\n(?! *\n))+)(?:\n *)+\n/gim,
            //
            // this excludes blockquotes using `(?!^>)`
            ///^((?:(?!^#)(?!^\-|\+)(?!^[0-9]+\.)(?!^!\[.*?\]\((.*?)\))(?!^>)(?!^\[\[.*?\]\])(?!^\{\{.*?\}\})[^\n]|\n(?! *\n))+)(?:\n *)+\n/gim,
            // html paragraph regex
            /<p(?:.*?)>(.*?)<\/p>/i,
            // -----------------------------------------------------------------------
            // @notes: setting as array require escaping `\`
            //['^((?:(?!^#)(?!^\-|\+)(?!^[0-9]+\.)(?!^\[\[.*?\]\])(?!^\{\{.*?\}\})[^\n]|\n(?! *\n))+)(?:\n *)+\n', 'gim'],
            //['<p(?:.*?)>(.*?)<\/p>', 'i'],
        ],
        // -------------------------------------------------------------------------
        // @consider description max words/char
        // -------------------------------------------------------------------------
        // order of what gets the highest priority:
        //
        // 1. frontmatter
        // 2. content markdown image such as `![alt text](http://url)`
        // 3. content regular html img
        image_sources: [
            "frontmatter",
            /!\[.*?\]\((.*?)\)/i,
            /<img.*?src=['"](.*?)['"]/i, // html image regex
            // -----------------------------------------------------------------------
            // @notes: setting as array require escaping `\`
            //['!\[.*?\]\((.*?)\)', 'i'],
            //['<img.*?src=[\'"](.*?)[\'"]', 'i'],
        ],
        // -------------------------------------------------------------------------
        // pages in current directories will be auto added as feed
        // unless they are disabled using their frontmatter
        // this option is used by the default is_feed_page function
        posts_directories: ["/blog/", "/_posts/"],
        // -------------------------------------------------------------------------
        // function to check if the page is to be used in a feed item
        is_feed_page: PLUGIN.is_feed_page,
        // -------------------------------------------------------------------------
        count: 20,
        // optional sorting function for the entries.
        // Gets the array entries as the input, expects the sorted array
        // as its output.
        // e.g.:	 sort:	entries => _.reverse( _.sortBy( entries, 'date' ) ),
        sort: (entries) => entries, // defaults to just returning it as it is
        // -------------------------------------------------------------------------
        // supported - use in config as needed
        // category
        // contributor
    };
    // ---------------------------------------------------------------------------
    return out;
};
// PLUGIN.get_options_defaults()
/**
 * @return {object}
 */
PLUGIN.get_options = (plugin_options, context) => {
    if (lodash_1.isEmpty(PLUGIN.options)) {
        PLUGIN.options = lodash_1.defaultsDeep(plugin_options, PLUGIN.get_options_defaults(context));
        // -------------------------------------------------------------------------
        // default link and id
        if (!PLUGIN.options.feedOptions.hasOwnProperty("link")) {
            PLUGIN.options.feedOptions.link = plugin_options.canonicalBase;
        }
        if (!PLUGIN.options.feedOptions.hasOwnProperty("id")) {
            PLUGIN.options.feedOptions.id = plugin_options.canonicalBase;
        }
        // -------------------------------------------------------------------------
        // default feedLinks
        if (!PLUGIN.options.feedOptions.hasOwnProperty("feedLinks") &&
            !lodash_1.isEmpty(PLUGIN.options.feeds)) {
            PLUGIN.options.feedOptions.feedLinks = {};
            const feeds = PLUGIN.options.feeds || {};
            for (let key of Object.keys(feeds)) {
                if (!PLUGIN.allowed_feed_types.includes(key)) {
                    continue;
                }
                const url = PLUGIN.get_feed_url(feeds[key]);
                if (!url) {
                    continue;
                }
                key = key.replace(/[0-9]/g, ""); // remove numbers from key;
                PLUGIN.options.feedOptions.feedLinks[key] = url;
            }
        }
        // -------------------------------------------------------------------------
        // internal - used in other files/classes
        PLUGIN.options._internal = {
            ...PLUGIN,
        };
    }
    // ---------------------------------------------------------------------------
    return PLUGIN.options;
};
// PLUGIN.get_options()
/**
 * @return {bool}
 */
PLUGIN.good_to_go = (plugin_options, context) => {
    const options = PLUGIN.get_options(plugin_options, context);
    // ---------------------------------------------------------------------------
    return (options.canonicalBase && !lodash_1.isEmpty(options.feeds) && !lodash_1.isEmpty(PLUGIN.pages));
};
/**
 * @return {string}
 */
PLUGIN.get_feed_url = (feed) => {
    if (feed.enable && feed.fileName) {
        return utils_1.default.resolveUrl(PLUGIN.options.canonicalBase, feed.fileName);
    }
};
PLUGIN.get_page_feed_settings = (frontmatter) => frontmatter.feed || {};
/**
 * @return {bool}
 */
PLUGIN.get_page_type = (frontmatter) => { var _a; return (_a = frontmatter.type) !== null && _a !== void 0 ? _a : ""; };
/**
 * @return {bool}
 */
PLUGIN.is_page_type_post = (frontmatter) => "post" === PLUGIN.get_page_type(frontmatter).toLowerCase();
/**
 * @return {bool}
 */
PLUGIN.is_feed_page = (page) => {
    const { frontmatter, path } = page;
    // ---------------------------------------------------------------------------
    if (!lodash_1.isEmpty(frontmatter)) {
        // use `frontmatter.feed.enable` to exclude a particular page/post
        // bailout if it is set to false
        const page_feed_settings = PLUGIN.get_page_feed_settings(frontmatter);
        /*
            if ( 		page_feed_settings.hasOwnProperty('enable')
                     && ! page_feed_settings.enable )
            {
                return false;
            }
            */
        // @notes:
        // as opposed to the above way of bailing out if set to false
        // the following means that any page that has `frontmatter.feed.enable`
        // set to true will be added
        if (page_feed_settings.hasOwnProperty("enable")) {
            return page_feed_settings.enable;
        }
        if (PLUGIN.is_page_type_post(frontmatter)) {
            return true;
        }
    }
    const directories = PLUGIN.options.posts_directories || [];
    if (!lodash_1.isEmpty(directories)) {
        for (const dir of directories) {
            if (path.startsWith(`${dir}`)) {
                return true;
            }
        }
    }
    return false;
};
// PLUGIN.is_feed_page()
module.exports = (plugin_options, context) => ({
    /**
     * used for collecting pages that would be used in feed;
     * the reason i'm using this, is that `getSiteData` only gets `page.toJson()`,
     * which only assigns preperties that don't start with '_'
     * and what i need is the $page._strippedContent to get content for the feed
     */
    extendsPageData($page) {
        // console.log($page)
        try {
            if (PLUGIN.get_options(plugin_options, context).is_feed_page($page)) {
                PLUGIN.pages.push($page);
            }
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    },
    /**
     * used for adding head links
     */
    async onPrepared() {
        try {
            if (PLUGIN.good_to_go(plugin_options, context)) {
                await new head_1.default(PLUGIN.options, context).add_links();
            }
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    },
    /**
     * used for generating the feed files
     */
    async onGenerated() {
        try {
            if (PLUGIN.good_to_go(plugin_options, context)) {
                await new generator_1.default(PLUGIN.pages, PLUGIN.options, context).generate();
            }
        }
        catch (err) {
            log_1.default.error(err.message);
        }
    },
});
//# sourceMappingURL=index.js.map