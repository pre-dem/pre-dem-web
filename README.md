# 准备工作
npm install

npm run build

# 使用
dist 文件夹中 pre-dem-web-xx.js 文件引入到 HTML 页面中

- 引入 js 文件
```
 <script type="text/javascript"
         src="./../dist/pre-dem-web-v1.0.16.js"
         data-app-key="${AppKey}"
         data-domain="${Domain}"
         data-ajax-enabled="${true | false}"
         data-crash-enabled="${true | false}"
         data-performance-enable="${true | false}"
         send-buffer-capacity="${Int}"></script>   
```     
- 参数说明
| 参数 | 类型 | 说明 |
| - | - |
| src | string | sdk 路径 |
| data-app-key | string | AppKey |
| data-domain | string | Domain |
| data-ajax-enabled | string | 是否开启 Ajax 上报,  "ture" or "false"|
| data-crash-enabled | string | 是否开启错误上报,  "ture" or "false"|
| data-performance-enable | string | 是否开启性能数据上报,  "ture" or "false"|
| send-buffer-capacity | string | 设置缓冲区的大小,ajax 合并发送的条数,  for example: "1"|

        
# 注意
不兼容 jquery 1.6 以下的版本

