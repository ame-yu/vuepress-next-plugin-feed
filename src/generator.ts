import { isEmpty } from "lodash"

import { path, fs, chalk } from "@vuepress/utils"
import { App, Page as PageData } from "@vuepress/core"
import log from "./log"
import Page from "./page"

import {FeedOptions as ModuleFeedOptions, Feed } from "feed"
import { PluginFeedOptions, PluginOptions } from "./types"


/**
 * Class responsible for generating the feed xml/json files
 */
class Generator {
  pages?: PageData
  options?: PluginOptions & any
  canonicalBase?: string
  feedOptions?: ModuleFeedOptions
  feeds?: PluginFeedOptions
  _internal?: any
  context: App
  feed_generator: Feed & any
  /**
   * constructor
   *
   * @param {array} pages
   * @param {object} options
   * @param {object} context
   */
  constructor(pages: PageData, options: PluginOptions, context: App) {
    if (isEmpty(pages)) {
      throw new Error("pages required")
    }

    if (!options.canonicalBase) {
      throw new Error("canonicalBase required")
    }

    this.pages = pages
    this.options = options
    this.canonicalBase = this.options.canonicalBase
    this.feedOptions = this.options.feedOptions ?? {id:"",copyright:"",title:""}
    this.feeds = this.options.feeds || {}
    this._internal = this.options._internal || {}

    this.context = context || {}
    this.feed_generator = new Feed(this.feedOptions!)
  }
  // constructor()

  /**
   * @return null
   */
  async add_items() {
    try {
      if (!this.options) return
      const pages = this.options?.sort(this.pages).slice(0, this.options.count)

      log.info("Adding pages/posts as feed items...")

      const out = []

      for (const page of pages) {
        const item = await new Page(
          page,
          this.options,
          this.context
        ).get_feed_item()

        if (!isEmpty(item)) {
          this.feed_generator.addItem(item)

          out.push(item)
        }
      }

      // -----------------------------------------------------------------------

      if (!isEmpty(out)) {
        log.success(
          `added ${chalk.cyan(out.length + " page(s)")} as feed item(s)`
        )
      }

      // -----------------------------------------------------------------------

      return out
    } catch (err) {
      log.error(err.message)
    }
  }
  // add_items()

  /**
   * @return null
   */
  add_categories() {
    try {
      const category = this.options?.category

      if (category) {
        const categories = Array.isArray(category) ? category : [category]

        categories.map((e) => this.feed_generator.addCategory(e))
      }
    } catch (err) {
      log.error(err.message)
    }
  }
  // add_categories()

  /**
   * @return null
   */
  add_contributors() {
    try {
      const contributor = this.options?.contributor

      if (contributor) {
        const contributors = Array.isArray(contributor)
          ? contributor
          : [contributor]

        contributors.map((e) => this.feed_generator.addContributor(e))
      }
    } catch (err) {
      log.error(err.message)
    }
  }
  // add_contributors()

  /**
   * @return {array}
   */
  async generate_files() {
    try {
      log.info("Checking feeds that need to be generated...")

      if (isEmpty(this.feeds)) {
        log.warn("no feeds set - aborting")

        return
      }

      // const cwd = process.cwd()
      const { dest, base } = this.context.options

      const out = []

      for (const key in this.feeds) {
        if (!this._internal.allowed_feed_types.includes(key)) {
          continue
        }

        const feed = this.feeds[key]

        if (!feed.enable || !feed.fileName) {
          continue
        }
        const content = this.feed_generator[key]()
        const file = path.resolve(dest, feed.fileName)
        const relative = path.relative(base, file)

        await fs.outputFile(file, content)

        log.success(
          `${key} feed file generated and saved to ${chalk.cyan(relative)}`
        )


        out.push(file)
      }

      return out
    } catch (err) {
      log.error(err.message)
    }
  }
  // generate_files()

  /**
   * @return {array}
   */
  async generate() {
    try {
      await this.add_items()

      this.add_categories()

      this.add_contributors()

      const files = await this.generate_files()

      return files
    } catch (err) {
      log.error(err.message)
    }
  }
}

export default Generator
