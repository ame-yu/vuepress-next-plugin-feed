"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const remove_markdown_1 = __importDefault(require("remove-markdown"));
const striptags_1 = __importDefault(require("striptags"));
const lodash_1 = require("lodash");
class Utils {
    static resolveUrl(base, path) {
        return `${lodash_1.trimEnd(base, "/")}/${lodash_1.trimStart(path, "/")}`;
    }
    static stripMarkup(str) {
        return striptags_1.default(remove_markdown_1.default(str, { useImgAltText: false }));
    }
    static isUrl(maybeUrl) {
        var _a;
        if (!maybeUrl || typeof maybeUrl !== "string")
            return false;
        const re_protocol_and_domain = /^(?:\w+:)?\/\/(\S+)$/;
        const matchRst = (_a = maybeUrl.match(re_protocol_and_domain)) === null || _a === void 0 ? void 0 : _a[1];
        if (!matchRst) {
            return false;
        }
        const re_domain_localhost = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
        const re_domain_non_localhost = /^[^\s\.]+\.\S{2,}$/;
        return (re_domain_localhost.test(matchRst) ||
            re_domain_non_localhost.test(matchRst));
    }
}
exports.default = Utils;
//# sourceMappingURL=utils.js.map