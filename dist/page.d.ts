import { Page as PageData, PageFrontmatter } from "@vuepress/core";
import { PluginOptions } from "./types";
/**
 * Class responsible for preparing a page data to be used as feed item
 */
declare class Page {
    key: string;
    path: string;
    $page: PageData;
    frontmatter: PageFrontmatter;
    feed_settings: any;
    excerpt: string;
    _strippedContent: string;
    options: PluginOptions;
    canonicalBase?: string;
    feedOptions: any;
    context: any;
    constructor($page: PageData, options: PluginOptions | undefined, context: any);
    url_resolve(path: string): string | undefined;
    extract_from_stripped_content(reg: RegExp | string, flag?: string): string | undefined;
    get_feed_setting(key: string, fallback?: boolean): string | undefined;
    /**
     * @return {string}
     */
    get title(): any;
    /**
     * @return {Date}
     */
    get date(): Date;
    /**
     * @return {string}
     */
    get url(): string | undefined;
    /**
     * @return {string}
     */
    get description(): any;
    /**
     * @wip
     * @return {string}
     */
    get content(): any;
    /**
     * @return {string} image url
     */
    get image(): any;
    get author(): string | undefined;
    get contributor(): string | undefined;
    /**
     * @return {object}
     */
    get_feed_item(): Promise<any>;
}
export default Page;
