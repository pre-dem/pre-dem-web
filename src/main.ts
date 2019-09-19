import dem from "./dem"
import Transfer from "./transfer"
import webData from './web-data'
import Transaction from "./transaction"

const APP_KEY_LENGTH = 24
const APP_ID_LENGTH = 8

export interface IPredemOptions {
    appKey: string
    domain: string
    httpEnabled?: boolean // 是否开启 http 请求上报
    crashEnabled?: boolean // 是否开启错误上报
    performanceEnabled?: boolean // 是否开启性能上报
    bufferCapacity?: number // 缓冲区的大小, 合并发送的条数
}


export class Predem {
    init(options: IPredemOptions) {
        const { appKey, domain, httpEnabled, crashEnabled, performanceEnabled, bufferCapacity } = options

        if (!appKey || appKey.length !== APP_KEY_LENGTH) {
            console.error("appKey is invalid")
            return
        }

        if (!domain) {
            console.error("domain is not defined")
            return
        }

        dem.messages.apiDomain = domain
        if (Number.isInteger(bufferCapacity)) {
            dem.messages.messageThreshold = bufferCapacity
        }

        const appId = appKey.substring(0, APP_ID_LENGTH)
        webData.init(appId, domain, `${!!httpEnabled}`, `${!!crashEnabled}`, `${!!performanceEnabled}`)

        this.initTransfer()
    }

    setTag(tag: string): void {
        webData.setTag(tag)
    }

    setAppVersion(version: string): void {
        webData.setVersion(version)
    }

    setPerformanceFilter(filterFunc): void {
        if (!filterFunc) {
            console.error("filter 不能为空！")
            return
        }

        if (!(filterFunc instanceof Function)) {
            console.error("filter 必须是 Function！")
            return
        }
        webData.setPerformanceFilter(filterFunc)
    }

    captureException(err: Error): void {
        dem.captureException(err)
    }

    sendEvents(events: any[]): any {
        if (!(events instanceof Array)) {
            console.log("Custom data need type Array")
            return
        }

        if (events.length === 0) {
            console.error("Custom data can not be empty")
            return
        }
        const event = events[0]
        if (event.eventName === "undefine" || event.eventData === "undefine") {
            console.error("Custom data must have eventName and eventData")
            return
        }

        return webData.sendEventData(events)
    }

    sendEvent(event) {
        if (!event) {
            return
        }
        this.sendEvents([event])
    }

    initTransfer() {
        const testTransfer = new Transfer(webData.tag, (datas, callback) => {
            webData.push(datas)
            callback()
        })
        dem.addTransfer(testTransfer)
    }

    transactionStart(name: string) {
        return new Transaction(name)
    }
}


const predem = new Predem()

export default predem
