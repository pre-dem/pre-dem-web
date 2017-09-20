# 准备工作
npm install 
npm run build

#使用
dist 文件夹中 pre-dem-browser.js 文件引入到 HTML 页面中

<script src="pre-dem-browser.js" type="text/javascript"/>
<script>
        window.InitWebSdk({tag: ${Tag}, token: ${Token}});
</script>

#上报数据

#错误信息
type CrashReportMeta struct {
	AppBundleId  string `json:"app_bundle_id"`
	AppName      string `json:"app_name"`
	AppVersion   string `json:"app_version"`
	DeviceModel  string `json:"device_model"`
	OsPlatform   string `json:"os_platform"`
	OsVersion    string `json:"os_version"`
	OsBuild      string `json:"os_build"`
	SdkVersion   string `json:"sdk_version"`
	SdkId        string `json:"sdk_id"`
	DeviceId     string `json:"device_id"`
	Tag          string `json:"tag"`
	Manufacturer string `json:"manufacturer"`
	ReportUUID   string `json:"report_uuid"`
	CrashLogKey  string `json:"crash_log_key"`
	StartTime    uint64 `json:"start_time"`
	CrashTime    uint64 `json:"crash_time"`
	Mode         string `json:"mode"`
	Message      string `json:"message"`
}

# http
type HttpMonitorModel struct {
	AppBundleId       string `json:"app_bundle_id"`
	AppName           string `json:"app_name"`
	AppVersion        string `json:"app_version"`
	DeviceModel       string `json:"device_model"`
	OsPlatform        string `json:"os_platform"`
	OsVersion         string `json:"os_version"`
	OsBuild           string `json:"os_build"`
	SdkVersion        string `json:"sdk_version"`
	SdkId             string `json:"sdk_id"`
	DeviceId          string `json:"device_id"`
	Tag               string `json:"tag"`
	Manufacturer      string `json:"manufacturer"`
	Domain            string `json:"domain"`
	Path              string `json:"path"`
	Method            string `json:"method"`
	HostIP            string `json:"host_ip"`
	StatusCode        int64  `json:"status_code"`
	StartTimestamp    uint64 `json:"start_timestamp"`
	ResponseTimeStamp uint64 `json:"response_time_stamp"`
	EndTimestamp      uint64 `json:"end_timestamp"`
	DnsTime           uint64 `json:"dns_time"`
	DataLength        uint64 `json:"data_length"`
	NetworkErrorCode  int64  `json:"network_error_code"`
	NetworkErrorMsg   string `json:"network_error_msg"`
}

## performance

type WebPerformance struct {
	Tag                        string `json:"tag"`
	Domain                     string `json:"domain"`
	Path                       string `json:"path"`
	Ua                         string `json:"ua"`
	Platform                   string `json:"platform"`
	NavigationStart            uint64 `json:"navigationStart"`
	UnloadEventStart           uint64 `json:"unloadEventStart"`
	UnloadEventEnd             uint64 `json:"unloadEventEnd"`
	RedirectStart              uint64 `json:"redirectStart"`
	RedirectEnd                uint64 `json:"redirectEnd"`
	FetchStart                 uint64 `json:"fetchStart"`
	DomainLookupStart          uint64 `json:"domainLookupStart"`
	DomainLookupEnd            uint64 `json:"domainLookupEnd"`
	ConnectStart               uint64 `json:"connectStart"`
	ConnectEnd                 uint64 `json:"connectEnd"`
	SecureConnectionStart      uint64 `json:"secureConnectionStart"`
	RequestStart               uint64 `json:"requestStart"`
	ResponseStart              uint64 `json:"responseStart"`
	ResponseEnd                uint64 `json:"responseEnd"`
	DomLoading                 uint64 `json:"domLoading"`
	DomInteractive             uint64 `json:"domInteractive"`
	DomContentLoadedEventStart uint64 `json:"domContentLoadedEventStart"`
	DomContentLoadedEventEnd   uint64 `json:"domContentLoadedEventEnd"`
	DomComplete                uint64 `json:"domComplete"`
	LoadEventStart             uint64 `json:"loadEventStart"`
	LoadEventEnd               uint64 `json:"loadEventEnd"`
	NavigationType             int64  `json:"navigationType"`
	RedirectCount              int64  `json:"redirectCount"`
	TriggerTime                uint64 `json:"triggerTime"`
}
