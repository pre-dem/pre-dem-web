# 准备工作
npm install

npm run build

# 使用
dist 文件夹中 pre-dem-web.js 文件引入到 HTML 页面中

 <script type="text/javascript"
        src="./../dist/pre-dem-web-v1.0.16.js"
        data-app-key="${AppKey}"
        data-domain="${Domain}"
        data-ajax-enabled="${true | false}"
        data-crash-enabled="${true | false}"
        data-performance-enable="${true | false}"
        send-buffer-capacity="${Int}"></script>

 data-app-key： AppKey
 data-domain: 上报的地址
 data-ajax-enabled： 是否开启 ajax 上报
 data-crash-enabled： 是否开启 crash 上报
 data-performance-enable：是否上报 performance 信息
 send-buffer-capacity： 设置缓冲区的大小， 也就是设置 ajax 合并发送的条数
 
 
 
        
# 注意
不兼容 jquery 1.6 以下的版本

