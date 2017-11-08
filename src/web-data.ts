/**
 * Created by sunfei on 2017/9/8.
 */

import { _window } from './detection'
import { getDominFromUrl, getCookier, setCookier, getExplorerInfo} from './utils'


const packageJson = require('../package.json')
const VERSION = packageJson.version;
const WEB_PLATFORM = "w";

class WebData {
    appId: string;
    domain: string;
    tag: string;
    osVersion: string;
    osBuild: string;
    uuid: string;

    constructor() {
        this.appId = "";
        this.domain = "";
        this.tag = "";
        this.osVersion = "";
        this.osBuild = "";

        let predemUuid = "";

        if (localStorage === undefined) {
            console.log("not support localStorage");
            predemUuid = getCookier(predemUuid);
            console.log("getCookier predemUuid:", predemUuid);
        } else {
            predemUuid = window.localStorage["predemUuid"];
        }

        if (predemUuid !== undefined  && predemUuid !== null && predemUuid.length > 0) {
            this.uuid = predemUuid;
        } else {
            predemUuid = this.generateUUID();
            if (localStorage === undefined) {
                setCookier("predemUuid", predemUuid);
            } else {
                window.localStorage["predemUuid"] = predemUuid;
            }
            this.uuid = predemUuid;
        }


        const explorerInfo: any = getExplorerInfo();
        let version = "";
        if (explorerInfo !== {}) {
            version = explorerInfo.version;
            if (version) {
                const versionArray = version.split(".");
                if (versionArray.length === 1) {
                    this.osVersion = versionArray[0];
                } else if (versionArray.length >= 2) {
                    this.osVersion = versionArray[0];
                    this.osBuild = versionArray[1];
                }
            }
        }
    }

    init(appId: string, domain: string): void {
        this.appId = appId;
        this.domain = domain;
    }

    setTag(tag: string): void {
        this.tag = tag;
    }

    sendEventData(name: string, data): any {
        const url = this.postDataUrl(this.domain, "event", this.appId);
        const eventData = this.initCustomEvent(this.appId, this.tag, name, data);
        return _window._origin_fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        })

    }

    push(datas: any): any {

        let type = datas.category;
        if (datas instanceof Array) {
            type = 'network'
        }
        const url = this.postDataUrl(this.domain, type, this.appId);
        if (datas instanceof Array) { //true 数组 network
            const array = [];
            datas.map((data) => {
                const errorobj = this.initNetworkData(this.appId, data, this.tag);
                array.push(errorobj)
            });
            return this.getRequestFun(url, type, array.join("\n"))

        } else {
            let result: any;
            if (datas.category === 'error') {
                result = this.initErrorData(this.appId, datas, this.tag);
            } else {
                result = this.initPerformance(this.appId, datas, this.tag);
            }
            return this.getRequestFun(url, type, result)
        }

    }

    postDataUrl(domain: string, category: string, appId: string): string {
        switch (category) {
            case 'error': {
               return domain + '/v1/' + appId +'/crashes/' + WEB_PLATFORM;
            }
            case 'performance': {
                return domain + '/v1/' + appId +'/web/performance/' + WEB_PLATFORM;
            }
            case 'network': {
                return domain + '/v1/' + appId +'/http-stats/' + WEB_PLATFORM;
            }
            case 'event': {
                return domain + '/v1/' + appId +'/events';
            }
        }
        return "";
    }

    initCustomEvent(AppId: string, tag: string, name: string, content: string): any {

        return {
            app_id: AppId,
            app_bundle_id: window.location.host,
            app_name: "",
            app_version: "",
            device_model: this.getDeviceModel(),
            manufacturer: "",
            device_id: "",
            os_platform: "web",
            os_version: this.osVersion,
            os_build: this.osBuild,
            sdk_version: VERSION,
            sdk_id: this.uuid,
            tag: tag,
            type: "custom",
            name: name,
            content: content,
        }

    }

    initPerformance(AppId: string, message: any, tag: string): any {
        const timing = message.payload.timing;
        const navigation = message.payload.navigation;
        const timingStr = JSON.stringify(timing);
        const performance = {
            app_id:         AppId,
            tag:            tag,
            domain:         window.location.host,
            path:           window.location.pathname,
            ua:             this.getDeviceModel(),
            platform:       "web",
            navigationType: navigation.type,
            redirectCount:  navigation.navigation,
        };

        return  Object.assign(
            performance,
            JSON.parse(timingStr),
            {triggerTime: message.timestamp},
        )
    }

    initNetworkData(AppId: string, message: any, tag: string): any {
        const networkErrorCode = message.payload.status_code !== 200 ? message.payload.status_code : 0;
        const networkErrorMsg = message.payload.status_code !== 200 ? message.payload.responseText : "";
        const dataLength = message.payload.contentLength ? message.payload.contentLength : 0;
        const responseTimeStamp =  message.payload.ResponseTimeStamp ? message.payload.ResponseTimeStamp : 0;
        const network  = {
            AppBundleId:        window.location.host,
            AppName:            "",
            AppVersion:         "",
            DeviceModel:        this.getDeviceModel(),
            OsPlatform:         "web",
            OsVersion:          this.osVersion,
            OsBuild:            this.osBuild,
            SdkVersion:         VERSION,
            SdkId:              this.uuid,
            DeviceId:           "",
            Tag:                tag,
            Manufacturer:       "",
            Domain:             getDominFromUrl(message.payload.url).domain,
            Path:               getDominFromUrl(message.payload.url).path,
            Method:             message.payload.method,
            HostIP:             "",
            StatusCode:         message.payload.status_code,
            StartTimestamp:     message.timestamp,
            ResponseTimeStamp:  responseTimeStamp,
            EndTimestamp:       message.timestamp +  message.payload.duration,
            DnsTime:            0,
            DataLength:         dataLength,
            NetworkErrorCode:   networkErrorCode,
            NetworkErrorMsg:    networkErrorMsg,
        };

        const networkData = [];
        for (const key in network) {
            if (network[key] === 0) {
                networkData.push(0)
            } else if (!network[key] || network[key] === "" || network[key] === null) {
                networkData.push("-")
            } else {
                networkData.push(network[key])
            }
        }
        return networkData.join("\t");
    }

    initErrorData(AppId: string, message: any, tag: string): any {
        const crash_log_key = JSON.stringify(message.payload.stack);
        return {
            app_id:         AppId,
            app_bundle_id:  window.location.host,
            app_name:       "",
            app_version:    "",
            device_model:   this.getDeviceModel(),
            os_platform:    "web",
            os_version:     this.osVersion,
            os_build:       this.osBuild,
            sdk_version:    VERSION,
            sdk_id:         this.uuid,
            device_id:      "",
            tag:            tag,
            report_uuid:    "",
            crash_log_key:  crash_log_key,
            manufacturer:   "",
            start_time:     0,
            crash_time:     message.timestamp,
            mode:           message.payload.mode,
            message:        message.payload.message,
        }
    }

    getDeviceModel(): string {
        return navigator.userAgent;
    }

    getErrorRequesFunc(url: string, result: any): any {
        return _window._origin_fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
        })
    }

    getPerformanceRequesFunc(url: string, result: any): any {
        return _window._origin_fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result),
        })


}

    getNetworkRequesFunc(url: string, result: any): any {
        return _window._origin_fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: result,
        })
    }

    getRequestFun(url: string, type: string, result: any): any {
        if (type === 'error') {
            return this.getErrorRequesFunc(url, result)
        } else if (type === 'network') {
            return this.getNetworkRequesFunc(url, result)
        } else {
            return this.getPerformanceRequesFunc(url, result)
        }
    }

    generateUUID() {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

}




const webData = new WebData();

export default webData;




