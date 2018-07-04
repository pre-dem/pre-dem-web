import { Dem } from '../dem'

import Source, { ISourceMessage } from '../source'
import { isString, isFunction, fill } from '../utils'
import { _window } from '../detection'

export interface IXHRMessage extends ISourceMessage {
  payload: {
    action?: string
    method: string
    url: string
    status_code?: string
    duration?: number // 0 for timeout
    response_text?: string
    start_timestamp?: number
    response_timestamp?: number
    content_length?: number
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
          const xhr = this
          xhr.__dem_xhr.start_timestamp = Date.now();
          const timeChecker = setTimeout(() => action({
            category: 'network',
            payload: xhr.__dem_xhr
          }), 30 * 1000 /* 30 sec */)

          function onreadystatechangeHandler() {
            if (xhr.__dem_xhr && (xhr.readyState === 2)) {
                xhr.__dem_xhr.response_timestamp = Date.now()
            }
            if (xhr.__dem_xhr && (xhr.readyState === 1 || xhr.readyState === 4)) {
                if (timeChecker) {
                clearTimeout(timeChecker)
              }

              try {
                // touching statusCode in some platforms throws
                // an exception
                xhr.__dem_xhr.end_timestamp = Date.now()
                xhr.__dem_xhr.status_code = xhr.status
                xhr.__dem_xhr.duration = xhr.__dem_xhr.end_timestamp - xhr.__dem_xhr.start_timestamp
                xhr.__dem_xhr.response_text = xhr.responseText
                const contentLength = xhr.responseText ? xhr.responseText.length : 0
                xhr.__dem_xhr.content_length = contentLength
              } catch (e) { /* do nothing */ }
               action({
                    category: 'network',
                    payload: xhr.__dem_xhr
                })

            }
          }

          function onloadstart(e) {
             xhr.__dem_xhr.response_timestamp = Date.now()
          }

          function onload(e) {
            xhr.__dem_xhr.status_code = e.target.status
            xhr.__dem_xhr.response_text = e.target.responseText
            xhr.__dem_xhr.content_length = e.total
            xhr.__dem_xhr.end_timestamp = Date.now()
            xhr.__dem_xhr.duration = xhr.__dem_xhr.end_timestamp - xhr.__dem_xhr.start_timestamp
            action({
              category: 'network',
              payload: xhr.__dem_xhr
            })
          }

          const props = [ 'onload', 'onerror', 'onprogress' ]
          for (const prop of props) {
            wrapProp(prop, xhr)
          }

          const jqueryVersion = window["$"] ? window["$"].prototype.jquery : ""
          if (jqueryVersion !== "") {
            const array = jqueryVersion.split(".")
            const firstVersion = array[0]
            const secondVersion = array[1]
              if (parseInt(firstVersion) < 2 && parseInt(secondVersion) >= 6) { // 低版本 使用 onload, 不兼容 1.5 以下包含1.5

                if ('onloadstart' in xhr && isFunction(xhr.onloadstart)) {
                    fill(xhr, 'onloadstart', (orig) => dem.wrap(orig, undefined, onloadstart))
                } else {
                    xhr.onloadstart = onloadstart
                }

                if ('onload' in xhr && isFunction(xhr.onload)) {
                    fill(xhr, 'onload', (orig) => dem.wrap(orig, undefined, onload))
                } else {
                    xhr.onload = onload
                }

            } else if (parseInt(firstVersion) >= 2){ // 高版本 使用 onreadystatechange
                if ('onreadystatechange' in xhr && isFunction(xhr.onreadystatechange)) {
                    fill(xhr, 'onreadystatechange', (orig) => dem.wrap(orig, undefined, onreadystatechangeHandler))
                } else {
                    xhr.onreadystatechange = onreadystatechangeHandler
                }
            } else {
                  console.error("jquert 版本过低,不兼容")
              }

          } else { // jquery 不存在
              if ('onreadystatechange' in xhr && isFunction(xhr.onreadystatechange)) {
                  fill(xhr, 'onreadystatechange', (orig) => dem.wrap(orig, undefined, onreadystatechangeHandler))
              } else {
                  xhr.onreadystatechange = onreadystatechangeHandler
              }
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
