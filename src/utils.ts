import { hasJSON, _window } from './detection'
import {parse} from 'url'

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

export function getDomainFromUrl(urlStr: string): any {

  if (!urlStr || urlStr.length === 0) {
    return {domain: "", path: ""}
  }

  if (urlStr.indexOf("://") === -1) {
    urlStr = document.location.protocol + "//" + window.location.host + urlStr;
  }


  const browserType = getBrowserInfo().type;
  if (browserType === "IE") {
    let domain = "";
    let path = "";
    if (urlStr.indexOf("?") !== -1) {
      const array = urlStr.split("//");
      if (array.length === 2) {
        const hostAndPathArray = array[1].split("/");
        if (hostAndPathArray.length === 2) {
            domain = hostAndPathArray[0]
            path = hostAndPathArray[1]
            return {domain: domain, path: path}
        }
      }

    }

    return {domain: "", path: ""}
  }

  const url = parse(urlStr);
  return {domain: url.host, path: url.path}
}

declare function escape(s: string): string;
declare function unescape(s: string): string;

export function getCookier(name: string): any {
  const reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  const arr = document.cookie.match(reg);
  if (arr) {
    return unescape(arr[2]);
  }
  return null;
}

export function setCookier (name: string, value: string): void {
  document.cookie = name + "=" + value + ";";
}

export function getBrowserInfo():  any {
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.indexOf("firefox") >= 0) { //firefox
    const ver = ua.match(/firefox\/([\d.]+)/)[1];
    return { type: "Firefox", version: ver };
  } else if (ua.indexOf("chrome") >= 0) { //Chrome
    const ver = ua.match(/chrome\/([\d.]+)/)[1];
    return { type: "Chrome", version: ver };
  } else if (ua.indexOf("opera") >= 0) { //Opera
    const ver = ua.match(/opera.([\d.]+)/)[1];
    return { type: "Opera", version: ver };
  } else if (ua.indexOf("safari") >= 0) { //Safari
    const ver = ua.match(/version\/([\d.]+)/)[1];
    return { type: "Safari", version: ver };
  } else if(!!window["ActiveXObject"] || "ActiveXObject" in window) {
     const rMsie = /(msie\s|trident.*rv:)([\w.]+)/;
     const match = rMsie.exec(ua);
     return { type: "IE", version: match[2]};
  }

  return {type: "", version: ""};
}




// 获取当前的 script
export function getCurrentScript() {
  if (document.currentScript) {
    return document.currentScript;
  }
  let current_script;
  const reg=".*pre-dem-web-v.*\.js";
  const scripts = document.getElementsByTagName("script");
  for(let i = 0, script, l = scripts.length; i < l; i++){
    script = scripts[i];
    const src=script.src||"";
    var mat = src.match(reg);
    if(mat) {
      current_script = script;
      break;
    }}
  return current_script;

}

export function generateUUID(): string {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};

export function localStorageIsSupported (): boolean {
  try {
    localStorage.setItem('supported', '1');
    localStorage.removeItem('supported');
    return true;
  } catch (error) {
    return false;
  }
};

