
import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'

(function (win){

    function PredemWebSdk() {
        this.setTag = function (tag: string) {
            predem.setTag(tag);
            predem.initTransfer();
        };
    }

    win["predem"] = new PredemWebSdk();


})(window);


class Predem {

    constructor() {
        this.init("{{.AppId}}", "{{.Domain}}");
        this.setErrorToken("{{.ErrorToken}}");
        this.setPerformanceToken("{{.PerformanceToken}}");
        this.setNetworkToken("{{.NetworkToken}}")
        this.setTag("{{.Tag}}")
    }

    init(appId: string, domain: string): void {
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




