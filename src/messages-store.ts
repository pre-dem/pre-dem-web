import {CollectionStore} from './store'
import {ISourceMessage} from './source'
import {Dem} from './dem'
import logger from './logger'
import webData from "./web-data"


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
  networkMessageArray = []
  consoleMessageArray = []
  messageThreshold = 10;
  maxTime = 3 * 60 * 60 * 1000

  constructor(parent: Dem) {
    this.parent = parent
  }

  add(data: ISourceMessage) {
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
    }

    if (message.data.category === 'network') {
      this.networkMessageArray.push(message);
      const subTime = new Date().getTime() - this.networkMessageArray[0].timestamp;
      if (this.networkMessageArray.length >= this.messageThreshold || subTime > this.maxTime) {
        this.networkMessageArray.map((message) => {
          this.store.push(message)
        });
        this.parent.transfers.forEach((transfer) => transfer.sendArray(this.networkMessageArray))
        this.networkMessageArray = []
      }
    } else if (message.data.category === 'console') {
      this.consoleMessageArray.push(message);
      const subTime = new Date().getTime() - this.consoleMessageArray[0].timestamp;
      if (this.consoleMessageArray.length >= this.messageThreshold || subTime > this.maxTime) {
        this.consoleMessageArray.map((message) => {
          this.store.push(message)
        });
        this.parent.transfers.forEach((transfer) => transfer.sendArray(this.consoleMessageArray))
        this.consoleMessageArray = []
      }
    } else {
      this.store.push(message);
      this.parent.transfers.forEach((transfer) => transfer.sendArray([message]))
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
