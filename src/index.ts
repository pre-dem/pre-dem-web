
import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'

(function (win){

    function PredemWebSdk() {

        this.initWebSdk = function (obj) {
            predem.initWebSdk(obj.appId, obj.domain)
        };

        this.setErrorToken = function (token: string) {
            predem.setErrorToken(token);
        };

        this.setNetworkToken = function (token: string) {
            predem.setNetworkToken(token);
        };

        this.setPerformanceToken = function (token: string) {
            predem.setPerformanceToken(token);
        };

        this.setTag = function (tag: string) {
            predem.setTag(tag);
            predem.initTransfer();
        };
    }

    win["predem"] = new PredemWebSdk();


})(window);


class Predem {

    initWebSdk(appId: string, domain: string): void {
        webData.init(appId, domain);
    }

    setErrorToken(token: string): void {
        webData.setErrorToken(token);
    }

    setNetworkToken(token: string): void {
        webData.setNetworkToken(token);
    }

    setPerformanceToken(token: string): void {
        webData.setPerformanceToken(token);
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




