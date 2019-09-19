# 准备工作
`yarn`

# 使用

## 通过 js 文件引入

1. `npm run build`
2. build 文件夹中 pre-dem-web-xx.js 文件引入到 HTML 页面中

### 示例

- 引入 js 文件
```html
<script type="text/javascript"
  src="PATH_TO_SCRIPT/pre-dem-web-v1.2.0.js"
  data-app-key="${AppKey}"
  data-domain="${Domain}"
  data-ajax-enabled="${true | false}"
  data-crash-enabled="${true | false}"
  data-performance-enable="${true | false}"
  send-buffer-capacity="${Int}">
</script>
```

- 参数说明

| 参数 | 类型 | 说明 |
| ---- | ---- | ---- |
| src | string | sdk 路径 |
| data-app-key | string | AppKey |
| data-domain | string | Domain |
| data-ajax-enabled | string | 是否开启 Ajax 上报,  "ture" or "false"|
| data-crash-enabled | string | 是否开启错误上报,  "ture" or "false" |
| data-performance-enable | string | 是否开启性能数据上报,  "ture" or "false" |
| send-buffer-capacity | string | 设置缓冲区的大小,ajax 合并发送的条数, for example: "1" |

## 通过 npm 引入

1. `package.json` 中添加依赖：`"pre-dem-web": "git+ssh://git@github.com/pre-dem/pre-dem-web.git#v1.2.0",`
2. 在所在项目入口或需要的地方 `import` 并调用 `init` 方法执行初始化。

### 示例

```js
import predem from 'pre-dem-web/dist/main'

predem.init({
  appKey: 'YOUR_APP_KEY',
  domain: 'YOUR_DOMAIN',
  httpEnabled: true
  crashEnabled: true
  performanceEnabled: true
  bufferCapacity: 100
})
```

init 参数说明

```ts
interface IPredemOptions {
  appKey: string               // AppKey
  domain: string               // 域名，eg: https://xxx.predem.qiniuapi.com
  httpEnabled?: boolean        // 是否开启 http 请求上报
  crashEnabled?: boolean       // 是否开启错误上报
  performanceEnabled?: boolean // 是否开启性能上报
  bufferCapacity?: number      // 缓冲区的大小, 合并发送的条数
}
```

# 注意
不兼容 jquery 1.6 以下的版本
