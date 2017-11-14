
import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'
import { getCurrentScript } from "./utils"
require('isomorphic-fetch');

(function (win){

    function PredemWebSdk() {

        this.setTag = function (tag: string) {
            predem.setTag(tag);
        };

        this.sendCustomEventData = function(eventName: string, eventData: string) {
            return predem.sendCustomEventData(eventName, eventData);
        };

        this.captureException = function (error: any) {
            return predem.captureException(error)

        }
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
        webData.init(appId, domain);
        webData.setTag(tag);
        this.initTransfer();

    }

    setTag(tag: string): void {
        webData.setTag(tag);
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
            return webData.push(datas)
        });
        dem.addTransfer(testTransfer)
    }

}


const predem = new Predem();

module.exports = predem;




