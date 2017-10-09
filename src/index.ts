
import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'

class Predem {

    constructor() {
        const appKey = document.currentScript.getAttribute("data-app-key");
        if (appKey.length <= 8) {
            console.error("appKey error");
        }
        const domain = document.currentScript.getAttribute("data-domain");
        if (domain.length <= 0) {
            console.error("domain can not be null");
        }
        const tag = document.currentScript.getAttribute("data-tag");
        const appId = appKey.substring(0, 8);
        webData.init(appId, domain);
        webData.setTag(tag);
        this.initTransfer();
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




