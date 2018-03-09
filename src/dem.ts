declare const global: any
declare const require: any
declare let dem_option: DemOption

import * as TraceKit from 'tracekit'

// Detection
import {
  _window, _document, _navigator,
  hasJSON, hasDocument, hasNavigator
} from './detection'

// Store
import { Store, CollectionStore } from './store'
import { MessagesStore } from './messages-store'

// Transfer
import Transfer from './transfer'

// Sources
import Source from './source'
import XHRSource from './sources/xhr'
import ExpectionSource from './sources/exception'
import PerformanceSource from './sources/performance'
import ConsoleSource from './sources/console'

// Logger
import logger, { ILogger } from './logger'

import {
  hasKey, merge, clone,
  isUndefined, isObject, isError, isNil, isFunction, isArray
} from './utils'

export type URLPattern = RegExp | string

export interface DemOption {
  release?: string
  environment?: string
  tags?: any
  whitelistUrls?: URLPattern[]
  ignoreUrls?: URLPattern[]
  ignoreError?: string[]
  autoInstall?: boolean
  instrument?: boolean | {
    tryCatch?: boolean
  }
  autoBreadcrumbs?: boolean | {
    xhr?: boolean
    console?: boolean
    performance?: boolean
  }

  transfer?: Transfer
  transfers?: Transfer[]
  sources?: Source<any>[]

  debug?: boolean
}

const DEFAULT_DEM_OPTION: DemOption = {
  environment: 'production',
  autoInstall: true,
  instrument: {
    tryCatch: true
  },
  autoBreadcrumbs: {
    xhr: true,
    console: false,
    performance: true
  }
}

export type ValueCallback<T> = (value?: T, callback?: ValueCallback<T>) => T

export class Dem {

  VERSION: '1.0.0'

  option: DemOption

  callbacks: { [key: string]: ValueCallback<any> } = {}

  configStore = new Store('config')
  contextStore = new Store('context')
  messages = new MessagesStore(this)

  transfers: Transfer[] = []
  sources: Source<any>[] = []

  __wrappedBuiltins: any[] = []

  get Transfer() {
    return Transfer
  }

  get Source() {
    return Source
  }

  get logger() {
    return logger
  }

  constructor(option: DemOption = {}) {
    this.option = merge(clone(DEFAULT_DEM_OPTION), option)

    if (this.option.debug) {
      this.debug = true
    }

    // Set Up
    if (this.option.release) {
      this.setRelease(this.option.release)
    }

    if (this.option.environment) {
      this.setEnvironment(this.option.environment)
    }

    if (this.option.transfer) {
      this.addTransfer(this.option.transfer)
    }

    if (this.option.transfers) {
      for (const transfer of this.option.transfers) {
        this.addTransfer(transfer)
      }
    }

    if (this.option.sources) {
      for (const source of this.option.sources) {
        this.addSource(source)
      }
    }

    if (this.option.autoInstall) {
      this.install()
    }
  }


  get debug(): boolean {
    return this.configStore.get('debug') || false
  }


  set debug(value) {
    if (value === true) {
      logger.info(`[CONFIG] set debug = ${value}`)
    }

    this.configStore.set('debug', value)
  }


  install() {
    // Instrument TryCatch
    if (this.option.instrument && this.option.instrument['tryCatch']) {
      this.addSource(ExpectionSource())
    }

    // Instrumeny Breadcrumb
    if (this.option.autoBreadcrumbs) {
      this._setupBreadcrumb()
    }

    return this
  }


  uninstall() {
    // Restore wrapped builtins
    this._restoreBuiltIns()

    // Dispose all sources
    this.sources.forEach((source) => source.dispose())

    return this
  }

  addSource(source: Source<any>) {
    if (!source) return

    source.onAction((message) => this.messages.add(message))

    this.sources.push(source)

    if (this.debug) {
      this.logger.info(`[SOURCE] added source ${source.name}`)
    }

    return this
  }

  addTransfer(transfer: Transfer) {
    transfer.config(this.configStore.toJS())

    this.transfers.push(transfer)
    
    if (this.debug) {
      this.logger.info(`[TRANSFER] added transfer ${transfer.name}`)
    }

    return this
  }

  config(key: string, value: string)

  config(object: any)

  config(keyOrObject: any, value?: string) {
    if (typeof keyOrObject === 'string') {
      const key: string = keyOrObject

      this.configStore.set(key, value)

      if (this.debug) {
        this.logger.info(`[CONFIG] set ${key} = ${value}`)
      }
    } else {
      for (const key in keyOrObject) {
        if (keyOrObject.hasOwnProperty(key)) {
          const value = keyOrObject[key]
          this.config(key, value)
        }
      }
    }

    return this
  }

  captureException(ex: Error, options: any = {}) {
    // If not an Error is passed through, recall as a message instead
    if (!isError(ex)) {
      return this.captureException(ex, merge({
        trimHeadFrames: 1,
        stacktrace: true // if we fall back to captureMessage, default to attempting a new trace
      }, options))
    }
    try {
      TraceKit.report(ex)
    } catch(ex1) {
      if (ex !== ex1) {
        throw ex1
      }
    }

    if (this.debug) {
      this.logger.error(`[EXCEPTION] capture exception: ${ex.message}`)
    }

    return this
  }


  setUserContext(user) {
    this.contextStore.set('user', user)

    if (this.transfers.length > 0) {
      this.transfers.forEach((transfer) => transfer.config(this.contextStore.toJS()))
    }

    if (this.debug) {
      this.logger.info(`[CONTEXT] set user context: ${user}`)
    }

    return this
  }

  setTagsContext(tags) {
    this.contextStore.set('tags', tags)
    
    if (this.transfers.length > 0) {
      this.transfers.forEach((transfer) => transfer.config(this.contextStore.toJS()))
    }
    
    if (this.debug) {
      this.logger.info(`[CONTEXT] set tags context: ${tags}`)
    }

    return this
  }


  setExtraContext(extra) {
    this.contextStore.set('extra', extra)

    if (this.transfers.length > 0) {
      this.transfers.forEach((transfer) => transfer.config(this.contextStore.toJS()))
    }
    
    if (this.debug) {
      this.logger.info(`[CONTEXT] set extra context: ${extra}`)
    }
    
    return this
  }

  clearContext() {
    this.contextStore.clear()
    
    if (this.debug) {
      this.logger.info(`[CONTEXT] clear context`)
    }

    return this
  }

  getContext() {
    return this.contextStore.toJS()
  }

  setEnvironment(env: string) {
    this.contextStore.set('environment', env)
    
    if (this.debug) {
      this.logger.info(`[CONTEXT] set environment context: ${env}`)
    }

    return this
  }

  setRelease(release: string) {
    this.contextStore.set('release', release)
    
    if (this.debug) {
      this.logger.info(`[CONTEXT] set release context: ${release}`)
    }

    return this
  }

  getCallback(key: string) {
    if (isNil(this.callbacks[key])) {
      return () => false
    }

    return this.callbacks[key]
  }

  setCallback(key: string, callback?: ValueCallback<any>) {
    if (isUndefined(callback)) {
      this.callbacks[key] = null
      
      if (this.debug) {
        logger.info(`[CALLBACK] remove ${key} callback`)
      }
    } else if (isFunction(callback)) {
      this.callbacks[key] = callback
      
      if (this.debug) {
        logger.info(`[CALLBACK] set ${key} callback`)
      }
    }
  }

  setBreadcrumbCallback(callback: ValueCallback<any>) {
    const original = this.getCallback('breadcrumb')
    this.setCallback('breadcrumb', composeCallback(original, callback))
  }

  setExceptionCallback(callback: ValueCallback<any>) {
    const original = this.getCallback('exception')
    this.setCallback('exception', composeCallback(original, callback))
  }

  wrap(options, func?, _before?) {

    if (isUndefined(func) && !isFunction(options)) {
      return options
    }

    if (isFunction(options)) {
      func = options
      options = undefined
    }

    if (!isFunction(func)) {
      return func
    }

    try {
      if (func.__dem__) {
        return func
      }

      if (func.__dem_wrapper__)  {
        return func.__dem_wrapper__
      }
    } catch (e) {

      return func
    }

    const self = this

    function wrapped() {
      var args = [], i = arguments.length,
          deep = !options || options && options.deep !== false

      if (_before && isFunction(_before)) {
          _before.apply(this, arguments)
      }

      while(i--) args[i] = deep ? self.wrap(options, arguments[i]) : arguments[i]

      try {
        return func.apply(this, args)
      } catch(e) {
        self._ignoreNextOnError()
        self.captureException(e, options)
        throw e
      }
    }

    for (const prop in func) {
      if (hasKey(func, prop)) {
        wrapped[prop] = func[prop]
      }
    }
    wrapped.prototype = func.prototype

    func.__dem_wrapper__ = wrapped
    wrapped['__dem__'] = true
    wrapped['__inner__'] = func

    if (this.debug) {
      const funcName = func.name || 'anynomous'
      logger.info(`wrap function ${funcName}`)
    }

    return wrapped
  }

  context(func, args: any[])
  context(func, options: any)
  context(func, args: any[], options: any)
  context(func, argsOrOptions: any, options?: any) {
    let args = null
    let opts = undefined

    switch (true) {
      case isArray(argsOrOptions) && isUndefined(options):  // overload +1
        args = argsOrOptions
        break

      case !isArray(argsOrOptions) && isUndefined(options):  // overload +2
        args = []
        opts = argsOrOptions
        break

      case isArray(argsOrOptions) && !isUndefined(options):  // overload +3
        args = argsOrOptions
        opts = options
        break
    }

    return this.wrap(options, func).apply(this, args)
  }

  _ignoreOnError = 0

  _ignoreNextOnError() {
    this._ignoreOnError += 1
    setTimeout(() => {
      this._ignoreOnError -= 1
    })
  }

  _setupBreadcrumb() {
    if (this.option.autoBreadcrumbs['xhr'] || this.option.autoBreadcrumbs === true) {
      this.addSource(XHRSource(this))
    }

    if (this.option.autoBreadcrumbs['performance'] || this.option.autoBreadcrumbs === true) {
      this.addSource(PerformanceSource())
    }

    if (this.option.autoBreadcrumbs['console'] || this.option.autoBreadcrumbs === true) {
      this.addSource(ConsoleSource())
    }

  }

  _restoreBuiltIns() {
    for (const [ obj, name, orig ] of this.__wrappedBuiltins) {
      obj[name] = orig
    }
  }
}

const dem = new Dem(_window.dem_option || {})

export default dem


function composeCallback(original: ValueCallback<any>, callback: ValueCallback<any>): ValueCallback<any> {
  return isFunction(callback)
    ? (data) => callback(data, original)
    : callback
}
