import { isEmpty } from "lodash"
import log from "./log"
import util from "./utils"
import {
  Page as PageData,
  resolvePageContent,
  PageFrontmatter,
} from "@vuepress/core"
import { PluginOptions } from "./types"

//https://github.com/vuepress/vuepress-next/discussions/43
/**
 * Class responsible for preparing a page data to be used as feed item
 */
class Page {
  key: string
  path: string
  $page: PageData
  frontmatter: PageFrontmatter
  feed_settings: any
  excerpt: string
  _strippedContent: string
  options: PluginOptions
  canonicalBase?: string
  feedOptions: any
  context: any
  constructor($page: PageData, options: PluginOptions = {}, context: any) {
    if (!options.canonicalBase) {
      throw new Error("canonicalBase required")
    }

    const { path, pathInferred } = $page

    this.path = path ?? pathInferred

    if (!this.path) {
      throw new Error("path required")
    }

    // -------------------------------------------------------------------------

    const {
      key, // page's unique hash key
      frontmatter, // page's frontmatter object
      excerpt,
      content,
    } = $page
    const _strippedContent = resolvePageContent({
      contentRaw: content,
    }).content

    this.$page = $page
    this.key = key
    this.frontmatter = frontmatter ?? {}
    this.feed_settings = (this.frontmatter?.feed as PageFrontmatter) ?? {}
    this.excerpt = excerpt
    this._strippedContent = _strippedContent

    this.options = options
    this.canonicalBase = this.options.canonicalBase
    this.feedOptions = this.options.feedOptions ?? {}

    this.context = context || {}
  }
  // constructor()

  url_resolve(path: string): string | undefined {
    if (this.canonicalBase && path) {
      return util.resolveUrl(this.canonicalBase, path)
    }
  }

  extract_from_stripped_content(reg: RegExp | string, flag?: string) {
    if (!this._strippedContent) {
      return
    }

    const regex = new RegExp(reg, flag)

    if (!(regex instanceof RegExp)) {
      return
    }

    let match

    if ((match = regex.exec(this._strippedContent)) !== null) {
      if (match[1]) {
        return match[1]
      }
    }
  }

  get_feed_setting(key: string, fallback = true): string | undefined {
    try {
      if (this.feed_settings.hasOwnProperty(key)) {
        return this.feed_settings[key]
      }

      // -----------------------------------------------------------------------

      if (fallback && !isEmpty(this.feedOptions[key])) {
        return this.feedOptions[key]
      }
    } catch (err) {
      log.error(err.message)
    }
  }
  // get_feed_setting()

  /**
   * @return {string}
   */
  get title() {
    const { title } = this.$page

    return this.feed_settings.title || title
  }
  // get title()

  /**
   * @return {Date}
   */
  get date() {
    const { date } = this.$page
    return date && !date.startsWith("0") ? new Date(date) : new Date()
  }
  // get date()

  /**
   * @return {string}
   */
  get url() {
    return this.url_resolve(this.path)
  }
  // get url()

  /**
   * @return {string}
   */
  get description() {
    try {
      if (this.feed_settings.hasOwnProperty("description")) {
        return this.feed_settings.description
      }

      if (isEmpty(this.options.description_sources)) {
        return
      }

      let out = ""

      for (const source of this.options?.description_sources ?? []) {
        switch (source) {
          case "frontmatter":
            out = this.frontmatter.description || ""

            break

          case "excerpt":
            out = this.excerpt || ""

            break

          default:
            // content without frontmatter - used with regex

            out = this.extract_from_stripped_content(source) ?? ""

            break
        }

        if (!out) {
          continue
        }

        out = util.stripMarkup(out.trim())

        if (out) {
          break
        }
      }

      return out
    } catch (err) {
      log.error(err.message)
    }
  }

  /**
   * @wip
   * @return {string}
   */
  get content() {
    try {
      if (this.feed_settings.hasOwnProperty("content")) {
        return this.feed_settings.content
      }

      // -----------------------------------------------------------------------

      if (isEmpty(this.context.markdown)) {
        return
      }

      // @todo: should be generated html from markdown

      if (this._strippedContent) {
        const { html } = this.context.markdown.render(this._strippedContent)

        // ---------------------------------------------------------------------

        if (!html) {
          return
        }

        return html
      }

      // @consider falling back to excerpt or description
    } catch (err) {
      log.error(err.message)
    }
  }

  /**
   * @return {string} image url
   */
  get image() {
    try {
      if (this.feed_settings.hasOwnProperty("image")) {
        return this.feed_settings.image
      }

      if (isEmpty(this.options.image_sources)) {
        return
      }

      let out: string = ""

      for (const source of this.options?.image_sources ?? []) {
        switch (source) {
          case "frontmatter":
            out = (this.frontmatter.image as string) ?? ""

            break

          default:
            // content without frontmatter - used with regex
            out = this.extract_from_stripped_content(source) ?? ""

            break
        }

        if (out) {
          out = out.trim()

          break
        }
      }

      if (!out) {
        return
      }

      return util.isUrl(out) ? out : this.url_resolve(out)
    } catch (err) {
      log.error(err.message)
    }
  }

  get author() {
    return this.get_feed_setting("author")
  }

  get contributor() {
    return this.get_feed_setting("contributor")
  }

  /**
   * @return {object}
   */
  async get_feed_item() {
    try {
      // we need at least title or description

      const title = this.title
      const description = this.description

      if (!title && !description) {
        return
      }

      // -----------------------------------------------------------------------

      const url = this.url
      const out: any = {
        title,
        description,
        id: url, // @notes: i considered using key, but url is more relevant
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
      }

      // const keys:Array<> = ['author', 'contributor'];
      const keys: ["author", "contributor"] = ["author", "contributor"]
      //   const keys = (<T extends string[]>(...o: T) => o)("author", "contributor")
      for (const key of keys) {
        const res = this[key]

        if (!isEmpty(res)) {
          out[key] = Array.isArray(res) ? res : [res]
        }
      }

      return out
    } catch (err) {
      log.error(err.message)
    }
  }
}

export default Page
