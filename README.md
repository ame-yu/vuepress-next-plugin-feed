# vuepress-next-plugin-feed
适用于VuePress2.x的feed插件

项目未经过严格的测试，可能存在问题请提交Issue或PR。

## 主要修改
- 添加部分类型，移植到TypeScript
- 参数改驼峰。例`canonical_base`->`canonicalBase`

## 使用
当前没有发布到npm
使用请clone，参考[本地部署](https://vuepress2.netlify.app/guide/plugin.html#local-plugin)

比如复制到plugins文件夹
```
#.
const feed_options = {
    canonicalBase: 'https://username.github.io',
};

module.exports = {
  plugins: [
    [require("../../plugins/vuepress-next-plugin-feed/dist/index.js"), feed_options]
  ],
}
```

## 建议
本项目只做了简单的移植，并没有优化。

不想折腾的可以考虑使用含Feed的[vuepress-theme-hope](https://github.com/vuepress-theme-hope/vuepress-theme-hope)
