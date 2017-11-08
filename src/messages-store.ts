import { CollectionStore } from './store'
import { ISourceMessage } from './source'
import { Dem } from './dem'

import logger from './logger'

export interface IMessage {
  id: number,
  data: ISourceMessage
  sent: boolean
}

const breadcrumbCategories = [ 'console', 'history', 'ui.events', 'network' ]
const isBreadcrumb = (category: string) => {
  return breadcrumbCategories.indexOf(category) >= 0
}

export class MessagesStore {

  counter = 0

  parent: Dem
  store = new CollectionStore<IMessage>('messages')
  messageArray = []
  messageThreshold = 10;
  maxTime = 3 * 60 * 60 * 1000

  constructor(parent: Dem) {
    this.parent = parent
  }

  add(data: ISourceMessage) {
    const message: IMessage = {
      id: ++this.counter,
      data,
      sent: false
    }
    if (message.data.category !== 'network') {
      this.store.push(message);
      this.parent.transfers.forEach((transfer) => transfer.send(message))
    } else {
      this.messageArray.push(message)
      const subTime = new Date().getTime() - this.messageArray[0].timestamp
      if (this.messageArray.length >= this.messageThreshold || subTime > this.maxTime) {
        this.messageArray.map((message) => {
          this.store.push(message)
        })
        this.parent.transfers.forEach((transfer) => transfer.sendArray(this.messageArray))
        this.messageArray = []
      }
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
