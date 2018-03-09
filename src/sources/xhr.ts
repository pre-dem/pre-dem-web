import { Dem } from '../dem'

import Source, { ISourceMessage } from '../source'
import { isString, isFunction, fill } from '../utils'
import { _window } from '../detection'
require('isomorphic-fetch');

export interface IXHRMessage extends ISourceMessage {
  payload: {
    action?: string
    method: string
    url: string
    status_code?: string
    duration?: number // 0 for timeout
    responseText?: string
    responseTimestamp?: number
    contentLength?: number
  }
}

function genXHRMessage(action: string, method: string, url: string, status_code: string = null) {
  return {
    action, method, url, status_code, duration: 0
  }
}

export default (dem: Dem) => {

  function wrapProp(prop, xhr) {
    if (prop in xhr && isFunction(xhr[prop])) {
      fill(xhr, prop, (orig) => dem.wrap(orig)) // intentionally don't track filled methods on XHR instances
    }
  }

  if (!_window) return null

  return new Source<IXHRMessage>('breadcrumb.XHR', (action) => {
    // XMLHttpRequest
    if ('XMLHttpRequest' in _window) {
      const xhrproto = XMLHttpRequest.prototype

      fill(xhrproto, 'open', (originFunc) => {
        return function(method, url) { // preserve arity
          this.__dem_xhr = genXHRMessage('open', method, url)

          return originFunc.apply(this, arguments)
        }
      }, dem.__wrappedBuiltins)

      fill(xhrproto, 'send', (originFunc) => {
        return function(data) { // preserve arity
            console.log("this=", this);
          const xhr = this
          const startAt = Date.now()
          const timeChecker = setTimeout(() => action({
            category: 'network',
            payload: xhr.__dem_xhr
          }), 30 * 1000 /* 30 sec */)

          function onreadystatechangeHandler() {
            console.log("function onreadystatechangeHandler", xhr.readyState)
            if (xhr.__dem_xhr && (xhr.readyState === 2)) {
                xhr.__dem_xhr.responseTimestamp = Date.now()
            }
            if (xhr.__dem_xhr && (xhr.readyState === 1 || xhr.readyState === 4)) {
                if (timeChecker) {
                clearTimeout(timeChecker)
              }

              try {
                // touching statusCode in some platforms throws
                // an exception
                xhr.__dem_xhr.status_code = xhr.status
                xhr.__dem_xhr.duration = Date.now() - startAt
                xhr.__dem_xhr.responseText = xhr.responseText
                const contentLength = xhr.responseText ? xhr.responseText.length : 0;
                xhr.__dem_xhr.contentLength = contentLength;
              } catch (e) { /* do nothing */ }
              action({
                category: 'network',
                payload: xhr.__dem_xhr
              })
            }
          }

          const props = [ 'onload', 'onerror', 'onprogress' ]
          for (const prop of props) {
            wrapProp(prop, xhr)
          }

          if ('onreadystatechange' in xhr && isFunction(xhr.onreadystatechange)) {
            console.log("onreadystatechange in xhr", xhr)
            fill(xhr, 'onreadystatechange', (orig) => dem.wrap(orig, undefined, onreadystatechangeHandler))
          } else {
              console.log("xhr.onreadystatechange  == onreadystatechangeHandler")
              xhr.onreadystatechange = onreadystatechangeHandler
          }

          return originFunc.apply(this, arguments)
        }
      }, dem.__wrappedBuiltins)
    }

    // Fetch API
    if ('fetch' in _window) {
      _window['_origin_fetch'] = _window.fetch
      fill(_window, 'fetch', (origFetch) => {
        return (...args) => {
          const fetchInput = args[0]
          let method = 'GET'
          let url = null

          if (typeof fetchInput === 'string') {
            url = fetchInput
          } else {
            url = fetchInput.url
            if (fetchInput.method) {
              method = fetchInput.method
            }
          }

          if (args[1] && args[1].method) {
            method = args[1].method
          }

          const fetchData = {
            method, url, status_code: null, duration: 0, responseTimestamp: 0,
          }
          const startAt = Date.now()
          const timeChecker = setTimeout(() => action({
            category: 'network',
            payload: fetchData
          }), 30 * 1000 /* 30 sec */)

          return origFetch.apply(_window, args).then((resp) => {
            if (timeChecker) {
                clearTimeout(timeChecker)
            }
            fetchData.status_code = resp.status
            fetchData.responseTimestamp = Date.now()
            fetchData.duration = Date.now() - startAt
            action({
              category: 'network',
              payload: fetchData
            })

            return resp
          })
        }
      }, dem.__wrappedBuiltins)
    }
  })
}
