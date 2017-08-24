export function sendMessage() {
  if (window.top !== window) {
    var path = location.href.toString();
    var data = JSON.stringify({
      path: path.substr(path.indexOf('serve/') + 'serve'.length),
      height: document.body.scrollHeight
    });

    window.top.postMessage(data, '*');
  }
}

export function sendOpenMsg(url, target) {
  if (window.top !== window) {
    var data = JSON.stringify({
      url,
      target
    });

    window.top.postMessage(data, '*');
  }
}