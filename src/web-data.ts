/**
 * Created by sunfei on 2017/9/8.
 */

import {_window} from './detection'
import {getDominFromUrl, getCookier, setCookier, generateUUID, localStorageIsSupported, sendAjax} from './utils'


const packageJson = require('../package.json');
const VERSION = packageJson.version;

export class WebData {
  appId: string;
  domain: string;
  tag: string;
  uuid: string;
  performanceFilter: any;

  constructor() {
    this.appId = "";
    this.domain = "";
    this.tag = "";
    this.performanceFilter = null;

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

  init(appId: string, domain: string): void {
    this.appId = appId;
    this.domain = domain;
  }

  setTag(tag: string): void {
    this.tag = tag;
  }


  setPerformanceFilter(filter: any): void {
    this.performanceFilter = filter;
  }


  sendEventData(name: string, data): any {
    const url = this.postDataUrl(this.domain, "event", this.appId);
    const eventData = this.initCustomEvent(this.tag, name, data);
    return _window._origin_fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

  }

  push(datas: any): void {
    let type = datas.category;
    if (datas instanceof Array) {
      type = 'network'
    }
    const url = this.postDataUrl(this.domain, type, this.appId);
    let result: any;
    if (type === "performance") {
      result = this.initPerformance(datas, this.tag);
    } else if (type === "error") {
      result = this.initErrorData(datas, this.tag);
    } else {
      if (datas instanceof Array) {
        result = ""
        datas.map((data) => {
           if (getDominFromUrl(data.payload.url).Domain !== this.domain) {
             result = result + JSON.stringify(this.initNetworkData(data, this.tag)) + "\n";
           }
        });
        sendAjax('POST', url, 'application/json', result);
      }
    }
    sendAjax('POST', url, 'application/json', JSON.stringify(result));

  }

  postDataUrl(domain: string, category: string, appId: string): string {
    switch (category) {
      case 'error': {
        return domain + '/v2/' + appId + '/crashes';
      }
      case 'performance': {
        return domain + '/v2/' + appId + '/web/performances';
      }
      case 'network': {
        return domain + '/v2/' + appId + '/http-monitors';
      }
      case 'event': {
        return domain + '/v2/' + appId + '/custom-events';
      }
    }
    return "";
  }

  initCustomEvent(tag: string, name: string, content: string): any {

    return {
      time: Date.now(),
      type: "custom",
      name: name,
      sdk_version: VERSION,
      sdk_id: this.uuid,
      tag: tag,
      domain: window.location.host,
      path: window.location.pathname,
      content: content,
    }
  }

  initPerformance(message: any, tag: string): any {
    let resourceTimings = message.payload.resourceTimings;
    const timing = message.payload.timing;
    if (this.performanceFilter) {
      const newResourceTimings = this.performanceFilter(resourceTimings);
      if (!(newResourceTimings && (newResourceTimings instanceof Array))) {
        console.error("Performance Data has some Error!");
      } else {
        resourceTimings = newResourceTimings;
      }
    }

    return {
      time: Date.now(),
      type: "auto_captured",
      name: "performance",
      sdk_version: VERSION,
      sdk_id: this.uuid,
      tag: tag,
      domain: window.location.host,
      path: window.location.pathname,
      content: JSON.stringify({
        resourceTimings: JSON.stringify(resourceTimings),
        timing: JSON.stringify(timing)
      })
    };
  };

  initNetworkData(message: any, tag: string): any {
    const networkErrorCode = message.payload.status_code !== 200 ? message.payload.status_code : 0;
    const networkErrorMsg = message.payload.status_code !== 200 ? message.payload.responseText : "";
    const dataLength = message.payload.contentLength ? message.payload.contentLength : 0;
    const responseTimeStamp = message.payload.ResponseTimeStamp ? message.payload.ResponseTimeStamp : 0;
    return {
      time: Date.now(),
      type: "auto_captured",
      name: "monitor",
      sdk_version: VERSION,
      sdk_id: this.uuid,
      tag: tag,
      domain: window.location.host,
      path: window.location.pathname,
      content: JSON.stringify({
        domain: getDominFromUrl(message.payload.url).domain,
        path: getDominFromUrl(message.payload.url).path,
        method: message.payload.method,
        host_ip: "",
        status_code: message.payload.status_code,
        start_timestamp: message.timestamp,
        response_time_stamp: responseTimeStamp,
        end_timestamp: message.timestamp + message.payload.duration,
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
      sdk_version: VERSION,
      sdk_id: this.uuid,
      tag: tag,
      domain: window.location.host,
      path: window.location.pathname,
      content: JSON.stringify({
        crash_log_key: crash_log_key,
        crash_time: message.timestamp,
        mode: message.payload.mode,
        message: message.payload.message,
      })
    }
  }

}

const webData = new WebData();

export default webData;
