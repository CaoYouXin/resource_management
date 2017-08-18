import '../../../asset/highlight/default.css';
import '../../../css/all.css';
import '../../../css/post.css';
import '../../../css/post-code.css';
import Data from './data.html';
import { sendMessage } from '../../../js/sendMsg.js';

var divElem = document.createElement('div');
divElem.innerHTML = Data;
document.body.appendChild(divElem);

var preCodeElems = document.querySelectorAll('pre code');
for (var i = 0; i < preCodeElems.length; i++) {
  hljs.highlightBlock(preCodeElems[i]);
}

setInterval(sendMessage, 3000);