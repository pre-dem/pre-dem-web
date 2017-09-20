
import raven from "./raven"
import Transfer from "./transfer"
import { changeWebData } from './web-data'

class Main {
    constructor() {
    }

    initTransfer(token: string, tag: string) {
        const testTransfer = new Transfer("test", (datas) => {
            return changeWebData(datas, token, tag)
        });
        raven.addTransfer(testTransfer)
    }

}

const main = new Main();

window["InitWebSdk"] = function (obj) {
    main.initTransfer(obj.token, obj.tag)
};

export default main




