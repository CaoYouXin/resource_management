export function append(elem, htmldata) {
  var e = document.createElement('div');
  e.innerHTML = htmldata;

  while (e.firstChild) {
    elem.appendChild(e.firstChild);
  }
}