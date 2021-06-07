import { App, Page as PageData } from "@vuepress/core";
import { FeedOptions as ModuleFeedOptions, Feed } from "feed";
import { PluginFeedOptions, PluginOptions } from "./types";
/**
 * Class responsible for generating the feed xml/json files
 */
declare class Generator {
    pages?: PageData;
    options?: PluginOptions & any;
    canonicalBase?: string;
    feedOptions?: ModuleFeedOptions;
    feeds?: PluginFeedOptions;
    _internal?: any;
    context: App;
    feed_generator: Feed & any;
    /**
     * constructor
     *
     * @param {array} pages
     * @param {object} options
     * @param {object} context
     */
    constructor(pages: PageData, options: PluginOptions, context: App);
    /**
     * @return null
     */
    add_items(): Promise<any[] | undefined>;
    /**
     * @return null
     */
    add_categories(): void;
    /**
     * @return null
     */
    add_contributors(): void;
    /**
     * @return {array}
     */
    generate_files(): Promise<string[] | undefined>;
    /**
     * @return {array}
     */
    generate(): Promise<string[] | undefined>;
}
export default Generator;
