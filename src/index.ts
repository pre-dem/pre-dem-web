import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'
import Transaction from "./transaction";

import {getCurrentScript, stringIsNumber} from "./utils"

(function (win) {

    function PredemWebSdk() {

        this.setTag = function (tag: string) {
            predem.setTag(tag);
        };

        this.sendEvent = function (eventName: string, eventData: string) {
            return predem.sendEvents([{eventName: eventName, eventData: eventData}]);
        };

        this.sendEvents = function (events: any[]) {
            return predem.sendEvents(events);

        };

        this.captureException = function (error: any) {
            return predem.captureException(error)
        };

        this.setPerformanceFilter = function (filterFunc: any) {
            return predem.setPerformanceFilter(filterFunc);

        };

        this.setAppVersion = function (version: string) {
            predem.setAppVersion(version);
        };

        this.transactionStart = function (transactionName: string) {
            return predem.transactionStart(transactionName);
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
        } else {
            dem.messages.apiDomain = domain;
        }
        const tag = currentScript.getAttribute("data-tag");
        const appId = appKey.substring(0, APP_ID_LENGTH);

        const ajaxEnabled = currentScript.getAttribute("data-ajax-enabled");
        const crashEnabled = currentScript.getAttribute("data-crash-enabled");
        const webPerfEnabled = currentScript.getAttribute("data-performance-enable");

        const sendBuffeCapacity = currentScript.getAttribute("send-buffer-capacity");
        if (sendBuffeCapacity && sendBuffeCapacity.length > 0) {
            if (stringIsNumber(sendBuffeCapacity)) {
                dem.messages.messageThreshold = parseInt(sendBuffeCapacity);
            } else {
                console.error("ajax-store-length must a number string");
                return
            }
        }

        this.checkAttributeValue(ajaxEnabled);
        this.checkAttributeValue(crashEnabled);
        this.checkAttributeValue(webPerfEnabled);

        webData.setTag(tag);
        webData.init(appId, domain, ajaxEnabled, crashEnabled, webPerfEnabled);
        this.initTransfer();

    }

    checkAttributeValue(attribute: string): void {
        if (!(attribute === "true" || attribute === "false" || attribute === "" || attribute === null)) {
            console.error(attribute + " must set true or false or empty");
            return
        }
    }

    setTag(tag: string): void {
        webData.setTag(tag);
    }

    setAppVersion(version: string): void {
        webData.setVersion(version);
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

    sendEvents(events: any[]): any {
        if (!(events instanceof Array)) {
            console.log("Custom data need type Array");
            return
        }

        if (events.length === 0) {
            console.error("Custom data can not be empty");
            return
        }
        const event = events[0];
        if (event.eventName === "undefine" || event.eventData === "undefine") {
            console.error("Custom data must have eventName and eventData");
            return;
        }

        return webData.sendEventData(events);

    }


    initTransfer() {
        const testTransfer = new Transfer(webData.tag, (datas) => {
            return webData.push(datas);
        });
        dem.addTransfer(testTransfer)
    }

    transactionStart(name: string) {
        return new Transaction(name);
    }


}


const predem = new Predem();

module.exports = predem;




