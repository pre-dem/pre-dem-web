
import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'

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
        const appKey = document.currentScript.getAttribute("data-app-key");
        if (appKey.length != APP_KEY_LENGTH) {
            console.error("appKey error");
            return
        }
        const domain = document.currentScript.getAttribute("data-domain");
        if (domain.length == 0) {
            console.error("domain can not be null");
            return
        }
        const tag = document.currentScript.getAttribute("data-tag");
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
        return webData.sendEventData(eventName, JSON.stringify(eventData));
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




