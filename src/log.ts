import { chalk, logger } from "@vuepress/utils"

const chalkLogger: any = {
  pluginName: chalk.magenta("vuepress-next-plugin-feed"),
  info: (...args: any[]) => logger.info(chalkLogger.plugin_name, ...args),
  success: (...args: any[]) => logger.success(chalkLogger.plugin_name, ...args),
  tip: (...args: any[]) => logger.tip(chalkLogger.plugin_name, ...args),
  warn: (...args: any[]) => logger.warn(chalkLogger.plugin_name, ...args),
  error: (...args: any[]) => logger.error(chalkLogger.plugin_name, ...args),
}

export default chalkLogger
