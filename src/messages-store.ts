import {CollectionStore} from './store'
import {ISourceMessage} from './source'
import {Dem} from './dem'
import logger from './logger'
import webData from "./web-data"
import {localStorageIsSupported} from "./utils";


export interface IMessage {
    id: number,
    data: ISourceMessage
    sent: boolean
}

const breadcrumbCategories = ['console', 'history', 'ui.events', 'network']
const isBreadcrumb = (category: string) => {
    return breadcrumbCategories.indexOf(category) >= 0
}

export class MessagesStore {
    counter = 0
    parent: Dem
    store = new CollectionStore<IMessage>('messages')
    messageThreshold = 5
    apiDomain = "";
    maxTime = 5 * 60 * 1000

    constructor(parent: Dem) {
        this.parent = parent
    }

    add(data: ISourceMessage) {
        console.log("message data", data)
        // 判断是否 add 数据
        const appConfig = webData.getSendDataConfig();
        if (appConfig !== null) {
            if (data.category === "performance" && !appConfig.webPerfEnabled) {
                return
            } else if (data.category === "error" && !appConfig.crashEnabled) {
                return
            } else if (data.category === "network" && !appConfig.ajaxEnabled) {
                return
            }
        }

        const message: IMessage = {
            id: ++this.counter,
            data,
            sent: false
        };

        // 过滤 数据上报的请求
        if (message.data.category === 'network' && this.apiDomain != "") {
            if (message.data.payload.url.indexOf(this.apiDomain) !== -1) {
                return;
            }
        }

        if (localStorageIsSupported) {
            if (message.data.category === 'network' && this.messageThreshold > 1) {
                // 合并发送

                let networkMessageArray = [];

                if (window.localStorage["networkMessageArray"] === undefined) {
                    window.localStorage.setItem("networkMessageArray", "[]");
                }
                networkMessageArray = JSON.parse(window.localStorage["networkMessageArray"]);
                networkMessageArray.push(message);

                const subTime = new Date().getTime() - networkMessageArray[0].timestamp;

                if (networkMessageArray.length >= this.messageThreshold || subTime >= this.maxTime) {

                    networkMessageArray.map((message) => {
                        this.store.push(message)
                    });
                    this.parent.transfers.forEach((transfer) => transfer.sendArray(networkMessageArray))
                    window.localStorage.setItem("networkMessageArray", "[]");

                } else {
                    try {
                        window.localStorage.setItem("networkMessageArray", JSON.stringify(networkMessageArray));
                    } catch (e) {
                        this.store.push(message);
                        this.parent.transfers.forEach((transfer) => transfer.sendArray(networkMessageArray));
                        window.localStorage.setItem("networkMessageArray", "[]");
                    }
                }

            } else if (message.data.category === 'console' && this.messageThreshold > 1) {
                // 合并发送
                let consoleMessageArray = [];

                if (window.localStorage["consoleMessageArray"] === undefined) {
                    window.localStorage.setItem("consoleMessageArray", "[]");
                }
                consoleMessageArray = JSON.parse(window.localStorage["consoleMessageArray"]);
                consoleMessageArray.push(message);

                const subTime = new Date().getTime() - consoleMessageArray[0].timestamp;

                if (consoleMessageArray.length >= this.messageThreshold || subTime >= this.maxTime) {

                    consoleMessageArray.map((message) => {
                        this.store.push(message)
                    });
                    this.parent.transfers.forEach((transfer) => transfer.sendArray(consoleMessageArray))
                    window.localStorage.setItem("consoleMessageArray", "[]");

                } else {
                    try {
                        window.localStorage.setItem("consoleMessageArray", JSON.stringify(consoleMessageArray));
                    } catch (e) {
                        this.store.push(message);
                        this.parent.transfers.forEach((transfer) => transfer.sendArray(consoleMessageArray));
                        window.localStorage.setItem("consoleMessageArray", "[]");
                    }
                }

            } else {
                this.store.push(message);
                this.parent.transfers.forEach((transfer) => transfer.sendArray([message]))
            }

        } else { // 立即发送
            this.store.push(message);
            this.parent.transfers.forEach((transfer) => transfer.send(message))
        }


        if (isBreadcrumb(data.category)) {
            this.parent.getCallback('breadcrumb')(data)
        }

        if (data.category === 'error') {
            this.parent.getCallback('exception')(data)
        }

        if (this.parent.debug) {
            logger.log(`[MESSAGES] New message added [${data.category}], messages count: ${this.store.length}`)
            logger.log(`[MESSAGES]`, data)
        }
    }

}

