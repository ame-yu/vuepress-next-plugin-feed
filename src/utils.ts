import removeMd from "remove-markdown"
import stripTags from "striptags"
import { trimEnd, trimStart } from "lodash"

class Utils {
  static resolveUrl(base: string, path: string): string {
    return `${trimEnd(base, "/")}/${trimStart(path, "/")}`
  }

  static stripMarkup(str: string): string {
    return stripTags(removeMd(str, { useImgAltText: false }))
  }

  static isUrl(maybeUrl: string): boolean {
    if (!maybeUrl || typeof maybeUrl !== "string") return false

    const re_protocol_and_domain = /^(?:\w+:)?\/\/(\S+)$/

    const matchRst = maybeUrl.match(re_protocol_and_domain)?.[1]

    if (!matchRst) {
      return false
    }

    const re_domain_localhost = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/
    const re_domain_non_localhost = /^[^\s\.]+\.\S{2,}$/

    return (
      re_domain_localhost.test(matchRst) ||
      re_domain_non_localhost.test(matchRst)
    )
  }
}

export default Utils
