/**
 * Created by sunfei on 2017/9/8.
 */

import { _window } from './detection'
import { getDominFromUrl } from './utils'

const packageJson = require('../package.json')
const VERSION = packageJson.version;
const WEB_PLATFORM = "w";

class WebData {
    appId: string;
    domain: string;
    tag: string;
    uuid: string;

    constructor() {
        this.appId = "";
        this.domain = "";
        this.tag = "";

        let predemUuid = window.localStorage["predemUuid"];
        if (predemUuid !== undefined && predemUuid.length > 0) {
            this.uuid = predemUuid;
        } else {
            predemUuid = this.generateUUID();
            window.localStorage["predemUuid"] = predemUuid;
            this.uuid = predemUuid;

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
            SdkVersion:         VERSION,
            SdkId:              this.uuid,
            Tag:                tag,
            Domain:             getDominFromUrl(message.payload.url).domain,
            Path:               getDominFromUrl(message.payload.url).path,
            Method:             message.payload.method,
            StatusCode:         message.payload.status_code,
            StartTimestamp:     message.timestamp,
            ResponseTimeStamp:  responseTimeStamp,
            EndTimestamp:       message.timestamp +  message.payload.duration,
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
            sdk_version:    VERSION,
            sdk_id:         this.uuid,
            tag:            tag,
            crash_log_key:  crash_log_key,
            crash_time:     message.timestamp,
            mode:           message.payload.mode,
            message:        message.payload.message,
        }
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




