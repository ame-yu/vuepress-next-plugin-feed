declare class Utils {
    static resolveUrl(base: string, path: string): string;
    static stripMarkup(str: string): string;
    static isUrl(maybeUrl: string): boolean;
}
export default Utils;
