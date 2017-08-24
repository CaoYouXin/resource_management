export function append(elem, htmldata) {
  var e = document.createElement('div');
  e.innerHTML = htmldata;

  while (e.firstChild) {
    elem.appendChild(e.firstChild);
  }
}

export function event(elem, event, handler) {
  if (elem.addEventListener) {
    elem.addEventListener(event, handler);
  } else if (elem.attachEvent) {
    elem.attachEvent('on' + event, handler);
  } else {
    throw new Error('can not bind event handler');
  }
}