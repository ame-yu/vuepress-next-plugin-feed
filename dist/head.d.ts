import { App, HeadConfig } from "@vuepress/core";
import { PluginFeedOptions, PluginOptions } from "./types";
/**
 * Class responsible for adding links to head
 */
declare class Head {
    context: App;
    options: PluginOptions;
    canonicalBase: string;
    feeds?: PluginFeedOptions;
    _internal?: any;
    constructor(options: PluginOptions | undefined, context: App);
    get_feed_url(feed: any): string | undefined;
    /**
     * @return {array}
     */
    get_link_item(feed: any, site_title?: string): HeadConfig | undefined;
    /**
     * @return {array|undefined}
     */
    add_links(): Promise<([import("@vuepress/core").HeadTagEmpty, import("@vuepress/core").HeadAttrsConfig] | [import("@vuepress/core").HeadTagNonEmpty, import("@vuepress/core").HeadAttrsConfig, string] | undefined)[] | undefined>;
}
export default Head;
