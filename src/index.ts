
import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'

(function (win){

    function PredemWebSdk() {

        this.setTag = function (tag: string) {
            predem.setTag(tag);
        };
    }

    win["predem"] = new PredemWebSdk();


})(window);


const appKeyLength = 48
const appIdLength = 8


class Predem {

    constructor() {
        const appKey = document.currentScript.getAttribute("data-app-key");
        if (appKey.length <= appKeyLength) {
            console.error("appKey error");
            return
        }
        const domain = document.currentScript.getAttribute("data-domain");
        if (domain.length <= 0) {
            console.error("domain can not be null");
            return
        }
        const tag = document.currentScript.getAttribute("data-tag");
        const appId = appKey.substring(0, appIdLength);
        webData.init(appId, domain);
        webData.setTag(tag);
        this.initTransfer();
    }

    setTag(tag: string): void {
        webData.setTag(tag);
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




