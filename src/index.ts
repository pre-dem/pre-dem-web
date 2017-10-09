
import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'

(function (win){

    function PredemWebSdk() {

        this.setTag = function (tag: string) {
            predem.setTag(tag);
        };

        this.init = function (obj) {
            predem.init(obj.appKey, obj.domain)
        }
    }

    win["predem"] = new PredemWebSdk();

    })(window);


class Predem {

    init(appKey: string, domain: string): void {
        const appId = appKey.substring(0, 8);
        webData.init(appId, domain);
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




