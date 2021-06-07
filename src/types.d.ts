import { FeedOptions,Feed as ModuleFeed } from "feed";

interface PluginOptions{
    canonicalBase?:  string
    feedOptions?: FeedOptions
    description_sources?: string
    image_sources?: string,
    feeds?:PluginFeedOptions
    _internal?:InternalOption,
    contributor?:[],
    count?: number,
    category?: [] |string,
    sort?: Function
}

interface PluginFeedOptions extends Record<string, any> {
    atom1?:{}
    json1?:{}
    rss2?:{}
}


interface InternalOption{
    name: string,
    homepage: string,
    key: string,
    allowed_feed_types: string[],
    pages?: []
    options?: {}
}

interface Feed extends ModuleFeed,Record<string, any> {}