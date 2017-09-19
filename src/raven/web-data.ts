/**
 * Created by sunfei on 2017/9/8.
 */

import { _window } from './detection'

const VERSION = "1.0.0";
const WEB_PLATFORM = "w";
// const URL_HEADER = "http://hriygkee.bq.cloudappl.com";
const URL_HEADER ="http://jkbkolos.bq.cloudappl.com";
// const URL_HEADER = "";


export function initPerformance(AppId: string, message: any, tag: string): any {
    const timing = message.payload.timing;
    const navigation = message.payload.navigation;
    const timingStr = JSON.stringify(timing);
    const performance = {
        app_id: AppId,
        tag: tag,
        domain: getDominFromUrl(window.location.href).domain,
        path:  getDominFromUrl(window.location.href).path,
        ua: getDeviceModel(),
        platform: "web",
        navigationType: navigation.type,
        redirectCount: navigation.navigation,
        client_ip: "",
        country: "",
        province: "",
        city: "",
        isp: "",
    };

    return  Object.assign(
        performance,
        JSON.parse(timingStr),
        {triggerTime: message.timestamp},
    )
}

export function initNetworkData(AppId: string, message: any, tag: string): any {
    let networkErrorCode = 0;
    let networkErrorMsg = "";

    if (message.payload.status_code !== 200) {
        networkErrorCode = message.payload.status_code;
        networkErrorMsg = message.payload.responseText;
    }

    const dataLength = message.payload.contentLength ? message.payload.contentLength : 0;
    const responseTimeStamp =  message.payload.ResponseTimeStamp ? message.payload.ResponseTimeStamp : 0;
    const url = message.payload.url;
    const result  = {
        AppBundleId: "",
        AppName: "",
        AppVersion: "",
        DeviceModel: getDeviceModel(),
        OsPlatform: "web",
        OsVersion: "",
        OsBuild: "",
        SdkVersion: VERSION,
        SdkId: "",
        DeviceId: "",
        Tag: tag,
        Manufacturer: "",
        Domain: getDominFromUrl(url).domain,
        Path: getDominFromUrl(url).path,
        Method: message.payload.method,
        HostIP: "",
        StatusCode: message.payload.status_code,
        StartTimestamp: message.timestamp,
        ResponseTimeStamp: responseTimeStamp,
        EndTimestamp: message.timestamp +  message.payload.duration,
        DnsTime: 0,
        DataLength: dataLength,
        NetworkErrorCode:  networkErrorCode,
        NetworkErrorMsg: networkErrorMsg,
    };

    const resultArray = [];
    for (const key in result) {
        if (result[key] === 0) {
            resultArray.push(0)
        } else if (!result[key] || result[key] === "" || result[key] === null) {
            resultArray.push("-")
        } else {
            resultArray.push(result[key])
        }
    }
    return resultArray.join("\t");
}


export function initErrorData(AppId: string, message: any, tag: string): any {
    const crash_log_key = JSON.stringify(message.payload.stack);
    return {
        app_id: AppId,
        app_bundle_id: "",
        app_name: "",
        app_version: "",
        device_model: getDeviceModel(),
        os_platform: "web",
        os_version: "",
        os_build: "",
        sdk_version: VERSION,
        sdk_id: "",
        device_id: "",
        tag: tag,
        report_uuid: "",
        crash_log_key: crash_log_key,
        manufacturer: "",
        start_time: 0,
        crash_time: message.timestamp,
        mode: message.payload.mode,
        message: message.payload.message,
    }
}

function getDominFromUrl(url: string): any {
    const urlArray = url.split("//");
    if (urlArray.length === 2) {
        const array = urlArray[1].replace("/", " ").split(" ");
        if (array.length === 1) {
            return {domain: array[0], path: ""}
        }
        if (array.length == 2) {
            return {domain: array[0], path: array[1]}
        }
    }
    return {domain: "", path: ""}
}

export function getDeviceModel(): string {
    return navigator.userAgent;
}

export function postDataUrl(category: string, appId: string) {
    let url = URL_HEADER;
    switch (category) {
        case 'error': {
            url += '/v1/' + appId +'/crashes/' + WEB_PLATFORM;
            break
        }
        case 'performance': {
            url += '/v1/' + appId +'/web/performance/' + WEB_PLATFORM;
            break
        }
        default:
            url += '/v1/' + appId +'/http-stats/' + WEB_PLATFORM;
    }
    return url;
}
export function getErrorRequesFunc(url: string, result: any): any {
    return _window._origin_fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
    })
}

export function getPerformanceRequesFunc(url: string, result: any): any {
    return _window._origin_fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(result),
    })
}

export function getNetworkRequesFunc(url: string, result: any): any {
    return _window._origin_fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: result,
    })
}



export function getRequestFun(url: string, type: string, result: any): any {
    if (type === 'error') {
        return getErrorRequesFunc(url, result)
    } else if (type === 'network') {
        return getNetworkRequesFunc(url, result)
    } else {
      return getPerformanceRequesFunc(url, result)
    }
}

export function changeWebData(datas: any, appId: string, tag: string): any {
    let result: any;
    let type = datas.category;
    if (datas instanceof Array) {
        type = 'network'
    }
    const url = postDataUrl(type, appId);
    if (datas instanceof Array) { //true 数组 network
        const array = [];
        datas.map((data) => {
            const errorobj = initNetworkData(appId, data, tag);
            array.push(errorobj)
        });
        return getRequestFun(url, type, array.join("\n"))

    } else {
        if (datas.category === 'error') {
            const result = initErrorData(appId, datas, tag);
            return getRequestFun(url, type, result)
        } else {
            const result = initPerformance(appId, datas, tag);
            return getRequestFun(url, type, result)
        }
    }

}


