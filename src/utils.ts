import { hasJSON } from './detection'

export function fill(obj, name, replacement, track?) {
  var orig = obj[name]
  obj[name] = replacement(orig)
  if (track) {
    track.push([obj, name, orig])
  }
}

export interface IElementSerialization {
  tag: string
  class?: string[]
  id?: string
  data?: {
    [key: string]: string
  }
}

const dataAttrRegex = /^data-/

export function serializeDOMElement(dom: HTMLElement) {
  const dataSet = [].slice.call(dom.attributes)
    .filter(attr => dataAttrRegex.test(attr.name))
    .map(attr => [
      attr.name.substr(5).replace(/-(.)/g, ($0, $1) => $1.toUpperCase()),
      attr.value
    ])

  const data = {}
  for (const [ key, value ] of dataSet) {
    data[key] = value
  }

  const serialization: IElementSerialization = {
    tag: dom.tagName,
    class: dom.className !== '' ? dom.className.split(' ').filter(Boolean): null,
    id: dom.id || null,
    data
  }

  return serialization
}

const MAX_TRAVERSE_HEIGHT = 5
const MAX_OUTPUT_LEN = 80

export function htmlTreeAsString(elem) {
  /* eslint no-extra-parens:0*/
  const out = []
  const separator = ' > '
  const sepLength = separator.length
  let height = 0
  let len = 0
  let nextStr

  while (elem && height++ < MAX_TRAVERSE_HEIGHT) {

    nextStr = htmlElementAsString(elem)

    if (nextStr === 'html' || height > 1 && len + (out.length * sepLength) + nextStr.length >= MAX_OUTPUT_LEN) {
      break
    }

    out.push(nextStr)

    len += nextStr.length
    elem = elem.parentNode
  }

  return out.reverse().join(separator)
}

export function htmlElementAsString(elem) {
  const out = []
  let className
  let classes
  let key
  let attr
  let i

  if (!elem || !elem.tagName) {
    return ''
  }

  out.push(elem.tagName.toLowerCase())
  if (elem.id) {
    out.push('#' + elem.id)
  }

  className = elem.className
  if (className && typeof className === 'string') {
    classes = className.split(/\s+/)
    for (i = 0; i < classes.length; i++) {
      out.push('.' + classes[i])
    }
  }
  var attrWhitelist = ['type', 'name', 'title', 'alt']
  for (i = 0; i < attrWhitelist.length; i++) {
    key = attrWhitelist[i]
    attr = elem.getAttribute(key)
    if (attr) {
      out.push('[' + key + '="' + attr + '"]')
    }
  }
  return out.join('')
}

const objectPrototype = Object.prototype

export function hasKey(object, key) {
  return objectPrototype.hasOwnProperty.call(object, key);
}

export function merge(target, source) {
  const obj: any = {}

  for (const key in target) { obj[key] = target[key] }
  for (const key in source) { obj[key] = source[key] }

  return obj
}

// Simple type check utils
export function isString(raw) {
  return typeof raw === 'string'
}

export function isNull(raw) {
  return raw === null
}

export function isUndefined(raw) {
  return raw === void 0
}

export function isObject(raw) {
  return typeof raw === 'object'
}

export function isError(raw) {
  return raw instanceof Error
}

export function isNil(raw) {
  return isNull(raw) || isUndefined(raw)
}

export function isFunction(raw) {
  return typeof raw === 'function' &&
    raw.call && raw.apply
}

export function isArray(raw) {
  return raw instanceof Array && raw.push && raw.pop && raw.length
}

export function clone(raw) {
  if (hasJSON) {
    return JSON.parse(JSON.stringify(raw))
  } else {
    return raw
  }
}

export function timestampToUTCStr(timestamp: number): any {
  const date =  new Date(timestamp - 8 * 60 * 60 * 1000);
  let dateStr = convertDateToDateStr(date, true, "-").replace(" ", "T")
  dateStr += "Z"
  return dateStr
}

export function convertDateToDateStr(oldDate: Date, hasHour: boolean, separator: string): string {
  let dateStr = (oldDate.getFullYear()) + separator;
  if (oldDate.getMonth() + 1 < 10) {
    dateStr += "0" + (oldDate.getMonth() + 1) + separator;
  }else {
    dateStr = dateStr + (oldDate.getMonth() + 1) + separator;
  }
  if (oldDate.getDate() < 10) {
    dateStr += "0" + (oldDate.getDate());
  }else {
    dateStr += (oldDate.getDate());
  }

  if (!hasHour) {
    return dateStr;
  }
  dateStr += " ";

  if (oldDate.getHours() < 10) {
    dateStr += "0" + (oldDate.getHours()) + ":" ;
  }else {
    dateStr += (oldDate.getHours()) + ":";
  }
  if (oldDate.getMinutes() < 10) {
    dateStr += "0" + (oldDate.getMinutes()) + ":" ;
  }else {
    dateStr += (oldDate.getMinutes()) + ":";
  }

  if (oldDate.getSeconds() < 10) {
    dateStr += "0" + (oldDate.getSeconds());
  } else {
    dateStr += (oldDate.getSeconds());
  }
  return dateStr;
}

export function getDominFromUrl(urlStr: string): any {
  if (urlStr.indexOf("://") === -1) {
    urlStr = window.location.host + urlStr;
  }
  if (!urlStr || urlStr.length === 0) {
    return {domain: "", path: ""}
  }
  const url = new URL(urlStr);
  return {domain: url.host, path: url.pathname}
}
