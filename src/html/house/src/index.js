import '../../../asset/jplayer/jplayer.blue.monday.css';
import '../../../css/all.css';
import '../../../css/post.css';
import Data from './data.html';
import Images from './images.html';
import { sendMessage } from '../../../js/sendMsg.js';
import { append } from '../../../js/dom.js';

var divElem = document.createElement('div');
divElem.style.overflow = 'hidden';
divElem.innerHTML = Data;
document.body.appendChild(divElem);

append(document.getElementById('images'), Images);

new jPlayerPlaylist({
  jPlayer: "#jquery_jplayer_1",
  cssSelectorAncestor: "#jp_container_1"
}, [
    {
      title: "客厅",
      artist: "Me",
      free: true,
      m4v: "http://image.caols.tech/house/VID_20161225_102638_1.mp4"
    },
    {
      title: "卧室",
      artist: "Me",
      m4v: "http://image.caols.tech/house/VID_20161225_102638_2.mp4"
    }
  ], {
    swfPath: "http://server.caols.tech:9999/serve/asset/jplayer/jquery.jplayer.swf",
    supplied: "webmv, ogv, m4v",
    useStateClassSkin: true,
    autoBlur: false,
    smoothPlayBar: true,
    keyEnabled: true
  });

window.handlers = {
  toCover: function (e) {
    var src = e.target.getAttribute('src');

    cover.style.backgroundImage = 'url("' + src + '")';
    cover.style.backgroundPosition = 'center';
    cover.style.backgroundRepeat = 'no-repeat';
    cover.style.backgroundSize = 'contain';
    cover.style.opacity = '1';
    cover.style.visibility = 'visible';
  },
  hideCover: function () {
    var elem = document.getElementById('cover');
    elem.style.opacity = '0';
    var timeout = setTimeout(function () {
      elem.style.visibility = 'hidden';
      clearTimeout(timeout);
    }, 900);
  }
};

setInterval(sendMessage, 3000);