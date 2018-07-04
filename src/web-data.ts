/**
 * Created by sunfei on 2017/9/8.
 */

import {_window} from './detection'
import {
    getCookier, setCookier, generateUUID
    , localStorageIsSupported, convertDateToDateStr, getDomainAndPathInfoFromUrl
} from './utils'
import Transaction from "./transaction";


const packageJson = require('../package.json');
const VERSION = packageJson.version;


export class WebData {
    appId: string;
    domain: string;
    tag: string;
    ajaxEnabled: boolean;
    crashEnabled: boolean;
    webPerfEnabled: boolean;
    uuid: string;
    performanceFilter: any;
    appVersion: string;

    constructor() {
        this.appId = "";
        this.domain = "";
        this.tag = "";
        this.ajaxEnabled = true;
        this.crashEnabled = true;
        this.webPerfEnabled = true;
        this.performanceFilter = null;
        this.appVersion = "1.0.0";

        let predemUuid = "";

        if (localStorageIsSupported()) {
            predemUuid = window.localStorage["predemUuid"];
        } else {
            predemUuid = getCookier(predemUuid);

        }

        if (predemUuid !== undefined && predemUuid !== null && predemUuid.length > 0) {
            this.uuid = predemUuid;
        } else {
            predemUuid = generateUUID();
            if (localStorageIsSupported()) {
                window.localStorage["predemUuid"] = predemUuid;
            } else {
                setCookier("predemUuid", predemUuid);
            }
            this.uuid = predemUuid;
        }
    }

    init(appId: string, domain: string, ajaxEnabled: string, crashEnabled: string, webPerfEnabled: string): void {
        this.appId = appId;
        this.domain = domain;
        this.ajaxEnabled = this.changeStringToBoolean(ajaxEnabled);
        this.crashEnabled = this.changeStringToBoolean(crashEnabled);
        this.webPerfEnabled = this.changeStringToBoolean(webPerfEnabled);

    }

    setTag(tag: string): void {
        this.tag = tag;
    }

    setVersion(version: string): void {
        this.appVersion = version;
    }

    setPerformanceFilter(filter: any): void {
        this.performanceFilter = filter;
    }

    getAppConfig(): void {
        const url = this.postDataUrl(this.domain, "app_config", this.appId);
        const data = this.initAppConfigData(this.tag);
        let oldAppConfig = null;
        if (localStorageIsSupported()) {
            oldAppConfig = window.localStorage["appConfig"];
        } else {
            oldAppConfig = getCookier("appConfig");
        }
        if (oldAppConfig === null || oldAppConfig === undefined) {
            // 获取 config
            this.fetchAppConfig(url, data);
        } else {
            const oldTimestamp = JSON.parse(oldAppConfig).time;
            const oldDateStr = convertDateToDateStr(new Date(oldTimestamp), false, "-");
            const nowDate = new Date();
            const nowDateStr = convertDateToDateStr(nowDate, false, "-");
            if (oldDateStr !== nowDateStr) {
                // 获取 config
                this.fetchAppConfig(url, data);
            }

        }

    }

    fetchAppConfig(url: string, data: any): any {
        _window._origin_fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(data),
        }).then((response: any) => {
            response.text().then((result) => {
                this.setAppConfig(JSON.parse(result));

            })
        }).catch((e: any) => {
            console.log("get app config error", e);
            const storageConfig = {
                ajaxEnabled: this.ajaxEnabled,
                crashEnabled: this.crashEnabled,
                webPerfEnabled: this.webPerfEnabled,
                time: new Date().getTime(),
            };

            if (localStorageIsSupported()) {
                window.localStorage["appConfig"] = JSON.stringify(storageConfig);
            } else {
                setCookier("appConfig", JSON.stringify(storageConfig));
            }
        })
    }

    setAppConfig(newAppConfig: any): void {
        const http_monitor_enabled = newAppConfig.http_monitor_enabled === true ? 1 : 0;
        const crash_report_enabled = newAppConfig.crash_report_enabled === true ? 1 : 0;
        const web_performance_enabled = newAppConfig.web_performance_enabled === true ? 1 : 0;

        const storageConfig = {
            ajaxEnabled: http_monitor_enabled,
            crashEnabled: crash_report_enabled,
            webPerfEnabled: web_performance_enabled,
            time: new Date().getTime(),
        };

        if (localStorageIsSupported()) {
            window.localStorage["appConfig"] = JSON.stringify(storageConfig);
        } else {
            setCookier("appConfig", JSON.stringify(storageConfig));
        }
    }

    getSendDataConfig(): any {
        let config = {
            ajaxEnabled: this.ajaxEnabled,
            crashEnabled: this.crashEnabled,
            webPerfEnabled: this.webPerfEnabled,
        };

        let storageConfigStr = "";

        if (localStorageIsSupported()) {
            storageConfigStr = window.localStorage["appConfig"];
        } else {
            storageConfigStr = getCookier("appConfig");
        }

        if (storageConfigStr === null || storageConfigStr === "" || storageConfigStr === undefined) {
            return config;
        }
        const storageConfig = JSON.parse(storageConfigStr);

        let ajaxEnabled = 1;
        let crashEnabled = 1;
        let webPerfEnabled = 1;

        if (!storageConfig.ajaxEnabled || !this.ajaxEnabled) {
            ajaxEnabled = 0;
        }
        if (!storageConfig.crashEnabled || !this.crashEnabled) {
            crashEnabled = 0;
        }

        if (!storageConfig.webPerfEnabled || !this.webPerfEnabled) {
            webPerfEnabled = 0;
        }

        return {
            ajaxEnabled: ajaxEnabled,
            crashEnabled: crashEnabled,
            webPerfEnabled: webPerfEnabled,
        };
    }

    sendEventData(batchData: any[]): any {
        const url = this.postDataUrl(this.domain, "event", this.appId);
        let data = "";
        batchData.map((event: any) => {
            const eventData = JSON.stringify(event.eventData)
            const eventstr = this.initCustomEvent(this.tag, event.eventName, eventData);
            data += JSON.stringify(eventstr) + "\n"
        });
        return _window._origin_fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: data,
        })

    }

    push(datas: any): any {
        let result = "";
        if (datas instanceof Array && datas.length > 0) {
            const type = datas[0].category;
            const url = this.postDataUrl(this.domain, type, this.appId);
            if (type === "performance") {
                result = JSON.stringify(this.initPerformance(datas[0], this.tag));
            } else if (type === "error") {
                result = JSON.stringify(this.initErrorData(datas[0], this.tag));
            } else if (type === "network") {
                datas.map((data) => {
                    result = result + JSON.stringify(this.initNetworkData(data, this.tag)) + "\n";
                });
            } else if (type === "console") {
                datas.map((data) => {
                    result = result + JSON.stringify(this.initConsoleData(data, this.tag)) + "\n";
                });
            }

            return this.getRequestFun(url, type, result)
        }

    }

    getRequestFun(url: string, type: string, result: string): any {
        if (_window._origin_fetch) {
            return _window._origin_fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: result,
            });
        } else {
           let xmlhttp = null;
           if (_window.XMLHttpRequest) {
               xmlhttp = new XMLHttpRequest();

           } else if (_window.ActiveXObject) {
               xmlhttp = new _window.ActiveXObject("Microsoft.XMLHTTP");
           }

            if (xmlhttp!=null) {
                xmlhttp.open("POST",url,true);
                xmlhttp.send(result);
            } else {
                alert("Your browser does not support XMLHTTP.");
            }
        }

    }

    postDataUrl(domain: string, category: string, appId: string): string {
        switch (category) {
            case 'app_config' : {
                return domain + '/v2/' + appId + '/app-config';
            }
            case 'error': {
                return domain + '/v2/' + appId + '/crashes';
            }
            case 'performance': {
                return domain + '/v2/' + appId + '/web-performances';
            }
            case 'network': {
                return domain + '/v2/' + appId + '/http-monitors';
            }
            case 'event': {
                return domain + '/v2/' + appId + '/custom-events';
            }
            case 'console': {
                return domain + '/v2/' + appId + '/log-capture';
            }
        }
        return "";
    }

    initCustomEvent(tag: string, name: string, content: string): any {

        return {
            time: Date.now(),
            type: "custom",
            name: name,
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: content,
        }
    }

    initPerformance(message: any, tag: string): any {
        const resourceTimings = message.payload.resourceTimings;
        const timing = message.payload.timing;
        let newResourceTimings = [];
        resourceTimings.map((resourceTiming: any) => {
            if (!(resourceTiming.entryType === "xmlhttprequest" && resourceTiming.name.indexOf(this.domain) !== 0)) {
                newResourceTimings.push(resourceTiming)
            }
        });

        if (this.performanceFilter) {
            const filterResultTimings = this.performanceFilter(newResourceTimings);
            if (!(filterResultTimings && (filterResultTimings instanceof Array))) {
                console.error("Filter should return array!");
            } else {
                newResourceTimings = filterResultTimings;
            }
        }

        return {
            time: Date.now(),
            type: "auto_captured",
            name: "performance",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: JSON.stringify({
                resourceTimings: newResourceTimings,
                timing: timing
            })
        };
    };

    initNetworkData(message: any, tag: string): any {
        const startTimestamp = message.payload.start_timestamp ? message.payload.start_timestamp : 0;
        const responseTimeStamp = message.payload.response_timestamp ? message.payload.response_timestamp : 0;
        const endTimeStamp = message.payload.end_timestamp ? message.payload.end_timestamp : 0;
        const networkErrorCode = message.payload.duration === 0 ? -1 : 0;
        const statusCode = networkErrorCode === -1 ? 0 : message.payload.status_code;
        const networkErrorMsg = message.payload.duration === 0 ? message.payload.responseText : "";
        const dataLength = message.payload.content_length ? message.payload.content_length : 0;
        const domainAndPath = getDomainAndPathInfoFromUrl(message.payload.url);
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "monitor",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: JSON.stringify({
                domain: domainAndPath.domain,
                path: domainAndPath.path,
                path1: domainAndPath.path1,
                path2: domainAndPath.path2,
                path3: domainAndPath.path3,
                path4: domainAndPath.path4,
                query: domainAndPath.query,
                url: message.payload.url,
                method: message.payload.method,
                host_ip: "",
                status_code: statusCode,
                start_timestamp: startTimestamp,
                response_time_stamp: responseTimeStamp,
                end_timestamp: endTimeStamp,
                dns_time: 0,
                data_length: dataLength,
                network_error_code: networkErrorCode,
                network_error_msg: networkErrorMsg,
            })
        };
    }

    initErrorData(message: any, tag: string): any {
        const crash_log_key = JSON.stringify(message.payload.stack);
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "crash",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: JSON.stringify({
                crash_log_key: crash_log_key,
                crash_time: message.timestamp,
                mode: message.payload.mode,
                message: message.payload.message,
            })
        }
    }

    initConsoleData(message: any, tag: string): any {
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "log",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            content: JSON.stringify({
                level: message.payload.level,
                message: message.payload.message,
            })
        }
    }

    initAppConfigData(tag: string): any {
        return {
            time: Date.now(),
            type: "auto_captured",
            name: "app",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
        }
    }

    initTransactionsData(): any {
        return {
            time: Date.now(),
            type: "custom",
            name: "auto_captured_transaction",
            app_version: this.appVersion,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: this.tag,
            content: "",
        }
    }

    changeStringToBoolean(enabled: string): boolean {
        if (enabled === "" || enabled === "true" || enabled === null) {
            return true
        }
        return false

    }

}

const webData = new WebData();

export default webData;
