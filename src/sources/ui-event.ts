import Source, { ISourceMessage, ActionFunc } from '../source'
import { fill, htmlTreeAsString } from '../utils'
import { _document, hasDocument } from '../detection'

let _keypressTimeout = null
let _lastCapturedEvent = null

function domEventHandler(evtName: string, action: ActionFunc<ISourceMessage>) {
  return (evt) => {

    _keypressTimeout = null

    if (_lastCapturedEvent === evt) return
    
    _lastCapturedEvent = evt

    let target = null
    try {
      target = htmlTreeAsString(evt.target)
    } catch(ex) {
      target = '<unknown>'
    }

    const payload: any = {
      event: evtName,
      path: target
    }

    if (evtName === 'click' || evtName === 'touchstart') {
      payload.pos = {
        x: evt.pageX,
        y: evt.pageY
      }
      payload.pageSize = {
        width: _document.body.offsetWidth,
        height: _document.body.offsetHeight
      }
    }

    action({
      category: 'ui.events',
      payload
    })
  }
}

const debounceDuration = 1000 // milliseconds

function keypressHandler(action: ActionFunc<ISourceMessage>) {
  return (evt) => {
    let target
    try {
      target = evt.target
    } catch(e) {
      return
    }

    const tagName = target && target.tagName

    if (!tagName || tagName !== 'INPUT' && tagName !== 'TEXTAREA' && !target.isContentEditable)
      return

    const timeout = _keypressTimeout
    if (!timeout) {
      domEventHandler('input', action)(evt)
    }
    
    clearTimeout(timeout)
    _keypressTimeout = setTimeout(() => {
      _keypressTimeout = null
    }, debounceDuration)
  }
}

export default () => {
  if (!_document || !hasDocument) return

  return new Source('breadcrumb.DOMEvents', (action) => {
    if (_document.addEventListener) {
      _document.addEventListener('click', domEventHandler('click', action), false)
      _document.addEventListener('keypress', keypressHandler(action), false)
    } else {
      // IE8 Compatibility
      _document.attachEvent('onclick', domEventHandler('click', action), false)
      _document.attachEvent('onkeypress', keypressHandler(action), false)
    }
  })
}