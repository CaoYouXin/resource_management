import { event } from './dom';
import { sendOpenMsg } from './sendMsg';

function handleA(aElem) {
  return function (e) {
    e.preventDefault();
    sendOpenMsg(aElem.href, aElem.target);
  };
}

export default function () {
  if (window.top === window) {
    return;
  }

  var aElems = document.querySelectorAll('a');
  for (var i = 0; i < aElems.length; i++) {
    event(aElems[i], 'click', handleA(aElems[i]));
  }
}