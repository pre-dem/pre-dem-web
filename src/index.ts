import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'

import {getCurrentScript} from "./utils"
require('isomorphic-fetch');

(function (win) {

  function PredemWebSdk() {

    this.setTag = function (tag: string) {
      predem.setTag(tag);
    };

    this.sendCustomEventData = function (eventName: string, eventData: string) {
      return predem.sendCustomEventData(eventName, eventData);
    };

    this.captureException = function (error: any) {
      return predem.captureException(error)

    };

    this.setPerformanceFilter = function (filterFunc: any) {
      return predem.setPerformanceFilter(filterFunc);

    };
  }

  win["predem"] = new PredemWebSdk();


})(window);


const APP_KEY_LENGTH = 24;
const APP_ID_LENGTH = 8;


class Predem {

  constructor() {
    const currentScript = getCurrentScript();
    if (!currentScript) {
      console.error("没有获取pre-dem-web script!");
    }
    const appKey = currentScript.getAttribute("data-app-key");
    if (appKey.length != APP_KEY_LENGTH) {
      console.error("appKey error");
      return
    }
    const domain = currentScript.getAttribute("data-domain");
    if (domain.length == 0) {
      console.error("domain can not be null");
      return
    }
    const tag = currentScript.getAttribute("data-tag");
    const appId = appKey.substring(0, APP_ID_LENGTH);
    const ajaxEnabled = currentScript.getAttribute("data-ajax-enabled");
    if (!(ajaxEnabled === "true" || ajaxEnabled === "false" || ajaxEnabled === "" || ajaxEnabled === null)) {
      console.error("ajaxEnabled must set true or false or empty");
      return
    }
    const crashEnabled = currentScript.getAttribute("data-crash-enabled");
    if (!(crashEnabled === "true" || crashEnabled === "false" || crashEnabled === "" || crashEnabled === null)) {
      console.error("crashEnabled must set true or false or empty");
      return
    }
    const webPerfEnabled = currentScript.getAttribute("data-web-performance");
    if (!(webPerfEnabled === "true" || webPerfEnabled === "false" || webPerfEnabled === "" || webPerfEnabled === null)) {
      console.error("webPerfEnabled must set true or false or empty");
      return
    }
    webData.setTag(tag);
    webData.init(appId, domain, ajaxEnabled, crashEnabled, webPerfEnabled);
    this.initTransfer();

  }

  setTag(tag: string): void {
    webData.setTag(tag);
  }

  setPerformanceFilter(filterFunc): void {
    if (!filterFunc) {
      console.error("filter 不能为空！");
      return
    }

    if (!(filterFunc instanceof Function)) {
      console.error("filter 必须是 Function！");
      return
    }
    webData.setPerformanceFilter(filterFunc);
  }

  captureException(err: Error): void {
    dem.captureException(err);
  }

  sendCustomEventData(eventName: string, eventData: any): any {
    if (!(eventData instanceof Array) && (eventData instanceof Object)) {
      return webData.sendEventData(eventName, JSON.stringify(eventData));
    }
    console.error("Custom data must key value,For exampe: {name: \"predem\"}");
  }

  initTransfer() {
    const testTransfer = new Transfer(webData.tag, (datas) => {
      return webData.push(datas);
    });
    dem.addTransfer(testTransfer)
  }

}


const predem = new Predem();

module.exports = predem;




