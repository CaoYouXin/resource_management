import '../../../css/all.css';
import '../../../css/post.css';
import Data from './data.html';
import { sendMessage } from '../../../js/sendMsg.js';

var divElem = document.createElement('div');
divElem.style.overflow = 'hidden';
divElem.innerHTML = Data;
document.body.appendChild(divElem);

setInterval(sendMessage, 3000);