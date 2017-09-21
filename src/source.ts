import { merge } from './utils'

export type SourceMessageType = 'message' | 'error'
export interface ISourceMessage {
  type?: SourceMessageType
  category: string
  payload: any
  timestamp?: number
  user?: any
  tags?: any
  extra?: any
}
export type ActionFunc<T> = (message: T) => any
export type ProcessorFunc<T> = (actionFunc: ActionFunc<T>) => any

const GEN_DEFAULT_SOURCE_MESSAGE = (): ISourceMessage => ({
  type: 'message',
  category: 'message',
  payload: {},
  timestamp: Date.now()
})

export default class Source<T> {

  name: string
  processor: ProcessorFunc<T>
  receivers: ActionFunc<T>[] = []

  constructor(name: string, processorFunc: ProcessorFunc<T>) {
    this.name = name
    this.processor = processorFunc

    processorFunc(this.action.bind(this))
  }

  action(message: ISourceMessage) {
    const mergedMessage = merge(GEN_DEFAULT_SOURCE_MESSAGE(), message)

    this.receivers.forEach((receiver) => receiver(mergedMessage))
  }

  onAction(callback: ActionFunc<T>) {
    this.receivers.push(callback)
  }

  dispose() {
    this.receivers.forEach((receiver) => receiver = null)
    this.receivers = []
  }
}
