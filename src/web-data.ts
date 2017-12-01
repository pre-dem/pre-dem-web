/**
 * Created by sunfei on 2017/9/8.
 */

import {_window} from './detection'
import {getDomainFromUrl, getCookier, setCookier, generateUUID
  , localStorageIsSupported, convertDateToDateStr } from './utils'


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

  constructor() {
    this.appId = "";
    this.domain = "";
    this.tag = "";
    this.ajaxEnabled = true;
    this.crashEnabled = true;
    this.webPerfEnabled = true;
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
      _window._origin_fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then((response: any) => {
        response.text().then((result) => {
          this.setAppConfig(JSON.parse(result));
        })
      })
    } else {
      const oldTimestamp = JSON.parse(oldAppConfig).time;
      const oldDateStr = convertDateToDateStr(new Date(oldTimestamp), false, "-");
      const nowDate = new Date();
      const nowDateStr = convertDateToDateStr(nowDate, false, "-");
      if (oldDateStr !== nowDateStr) {
        // 获取 config
        _window._origin_fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then((response: any) => {
          response.text().then((result) => {
            this.setAppConfig(JSON.parse(result));

          })
        })
      }

    }

  }

  setAppConfig(newAppConfig: any): void {
    const http_monitor_enabled = newAppConfig.http_monitor_enabled === true ? 1 : 0;
    const crash_report_enabled = newAppConfig.crash_report_enabled === true ? 1 : 0;
    const web_performance_enabled = newAppConfig.web_performance_enabled === true ? 1 : 0;

    const storageConfig = {
      ajax: http_monitor_enabled,
      crash: crash_report_enabled,
      webPerf: web_performance_enabled,
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
      ajax: this.ajaxEnabled,
      crash: this.crashEnabled,
      webPerf: this.webPerfEnabled,
    };

    let storageConfigStr = "";

    if (localStorageIsSupported()) {
      storageConfigStr =  window.localStorage["appConfig"];
    } else {
      storageConfigStr = getCookier("appConfig");
    }

    if (storageConfigStr === "" || storageConfigStr === undefined) {
      return config;
    }
    const storageConfig = JSON.parse(storageConfigStr);

    let ajaxEnabled = 1;
    let crashEnabled = 1;
    let webPerfEnabled = 1;

    if (!storageConfig.ajax || !this.ajaxEnabled) {
      ajaxEnabled = 0;
    }
    if (!storageConfig.crash || !this.crashEnabled) {
      crashEnabled = 0;
    }

    if (!storageConfig.webPerf || !this.webPerfEnabled) {
      webPerfEnabled = 0;
    }

    return {
      ajax: ajaxEnabled,
      crash: crashEnabled,
      webPerf: webPerfEnabled,
    };
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
          if (getDomainFromUrl(data.payload.url).Domain !== this.domain) {
            result = result + JSON.stringify(this.initNetworkData(data, this.tag)) + "\n";
          }
        });
      } else if (type === "console") {
        datas.map((data) => {
          result = result + JSON.stringify(this.initConsoleData(data, this.tag)) + "\n";
        });
      }
      return this.getRequestFun(url, type, result)


    }
    // let type = datas.category;
    // if (datas instanceof Array) {
    //   type = 'network'
    // }
    // const url = this.postDataUrl(this.domain, type, this.appId);
    // let result: any;
    // if (type === "performance") {
    //   result = this.initPerformance(datas, this.tag);
    // } else if (type === "error") {
    //   result = this.initErrorData(datas, this.tag);
    // } else {
    //   if (datas instanceof Array) {
    //     result = ""
    //     datas.map((data) => {
    //        if (getDomainFromUrl(data.payload.url).Domain !== this.domain) {
    //          result = result + JSON.stringify(this.initNetworkData(data, this.tag)) + "\n";
    //        }
    //     });
    //
    //     return this.getRequestFun(url, type, result)
    //   }
    // }
    // return this.getRequestFun(url, type, JSON.stringify(result))

  }

  getRequestFun(url: string, type: string, result: string): any {
    return _window._origin_fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: result,
      });
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
        return domain + '/v2/' + appId + '/web/performances';
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
    const networkErrorCode = message.payload.status_code !== 200 ? message.payload.status_code : 0;
    const networkErrorMsg = message.payload.status_code !== 200 ? message.payload.responseText : "";
    const dataLength = message.payload.contentLength ? message.payload.contentLength : 0;
    const responseTimeStamp = message.payload.ResponseTimeStamp ? message.payload.ResponseTimeStamp : 0;
    const domainAndPath = getDomainFromUrl(message.payload.url);
    return {
      time: Date.now(),
      type: "auto_captured",
      name: "monitor",
      sdk_version: VERSION,
      sdk_id: this.uuid,
      tag: tag,
      content: JSON.stringify({
        domain: domainAndPath.domain,
        path: domainAndPath.path,
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
      sdk_version: VERSION,
      sdk_id: this.uuid,
      tag: tag,
      content: JSON.stringify({
        level: message.payload.level,
        message: message.payload.msg,
      })
    }
  }

  initAppConfigData(tag: string): any {
    return {
      time: Date.now(),
      type: "auto_captured",
      name: "app",
      sdk_version: VERSION,
      sdk_id: this.uuid,
      tag: tag,
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
