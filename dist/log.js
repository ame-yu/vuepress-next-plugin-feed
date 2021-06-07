"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@vuepress/utils");
const chalkLogger = {
    pluginName: utils_1.chalk.magenta("vuepress-next-plugin-feed"),
    info: (...args) => utils_1.logger.info(chalkLogger.plugin_name, ...args),
    success: (...args) => utils_1.logger.success(chalkLogger.plugin_name, ...args),
    tip: (...args) => utils_1.logger.tip(chalkLogger.plugin_name, ...args),
    warn: (...args) => utils_1.logger.warn(chalkLogger.plugin_name, ...args),
    error: (...args) => utils_1.logger.error(chalkLogger.plugin_name, ...args),
};
exports.default = chalkLogger;
//# sourceMappingURL=log.js.map