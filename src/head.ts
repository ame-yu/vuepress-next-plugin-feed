import { isEmpty } from "lodash"
import { chalk } from "@vuepress/utils"
import log from "./log"
import util from "./utils"
import { App, HeadConfig } from "@vuepress/core"
import { PluginFeedOptions, PluginOptions } from "./types"

/**
 * Class responsible for adding links to head
 */
class Head {
  context: App
  options: PluginOptions
  canonicalBase: string
  feeds?: PluginFeedOptions
  _internal?: any
  constructor(options: PluginOptions = {}, context: App) {
    if (!options.canonicalBase) {
      throw new Error("canonicalBase required")
    }

    this.options = options
    this.canonicalBase = this.options.canonicalBase ?? ""
    this.feeds = this.options.feeds || {}
    this._internal = this.options._internal || {}
    this.context = context || {}
  }

  get_feed_url(feed: any): string | undefined {
    if (feed.head_link.enable && feed.enable && feed.fileName) {
      return util.resolveUrl(this.canonicalBase, feed.fileName)
    }
  }
  // get_feed_url()

  /**
   * @return {array}
   */
  get_link_item(feed: any, site_title = ""):HeadConfig | undefined {
    try {
      const href = this.get_feed_url(feed)

      if (!href) {
        return
      }


      const { type, title } = feed.head_link

      return [
        "link",
        {
          rel: "alternate",
          type,
          href,
          title: title.replace("%%site_title%%", site_title),
        },
      ]
    } catch (err) {
      log.error(err.message)
    }
  }
  // get_link_item()

  /**
   * @return {array|undefined}
   */
  async add_links() {
    try {
      if (isEmpty(this.feeds)) {
        return
      }


      const siteConfig = this.context.siteData

      siteConfig.head = siteConfig.head || []
      const site_title = siteConfig.title || ""

      const out = []

      for (const key in this.feeds) {
        if (!this._internal.allowed_feed_types.includes(key)) {
          continue
        }

        const item = this.get_link_item(this.feeds[key], site_title)

        if (isEmpty(item)) 
          continue
        
        siteConfig.head.push(item!)

        log.success(`${key} link added to ${chalk.cyan("siteConfig.head")}`)


        out.push(item)
      }


      return out
    } catch (err) {
      log.error(err.message)
    }
  }
}

export default Head
