import '../../../asset/highlight/default.css';
import '../../../css/all.css';
import '../../../css/post-table.css';
import '../../../css/post-code.css';
import '../../../css/book-list.css';
import Data from './data.html';
import Template from './template.html';
import JsonData from './data.json';
import JSONFormatter from 'json-formatter-js';
import { append } from '../../../js/dom.js';
import { sendMessage } from '../../../js/sendMsg.js';

var divElem = document.createElement('div');
divElem.innerHTML = Data;
document.body.appendChild(divElem);

var timeout = null;
window.handlers = {
  btnClicked: function (index) {

    console.log(index);

    var btns = document.querySelectorAll('.btns > .btn');
    var activeBtn = document.querySelector('.btns > .btn.active');

    if (activeBtn) activeBtn.classList.remove('active');
    btns[index].classList.add('active');

    var lis = document.querySelectorAll('ul.book-list-show > li');
    var activeLI = document.querySelector('ul.book-list-show > li.active');

    if (activeLI) activeLI.classList.remove('active');
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      if (activeLI) activeLI.style.display = 'none';
      lis[index].style.display = 'block';
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        lis[index].classList.add('active');
        clearTimeout(timeout);
      }, 500);
    }, 1000);
  },
  bookCornerClicked: function (index) {
    var elem = document.querySelector('.book-box:nth-child(' + (index + 2) + ') > .book-content');
    elem.classList.toggle('hidden');
    document.querySelector('.book-box:nth-child(' + (index + 2) + ') > .show-full-cover').innerHTML = elem.classList.contains('hidden') ? '-' : '+';
  },
  bookContentClicked: function (index) {
    document.querySelector('.book-box:nth-child(' + (index + 2) + ') > .book-content').classList.toggle('active');
  }
};

var codeElem = document.getElementById('code');
codeElem.appendChild(new JSONFormatter(JsonData).render());

var tableBody = document.querySelector('#table > tbody');
var keys = ['name', 'author', 'category', 'publish_time', 'publish_org', 'introduction', 'state', 'cover_url'];
JsonData.forEach(function (d) {
  var tr = document.createElement('tr');

  keys.forEach(function (k) {
    var td = document.createElement('td');

    if ('cover_url' === k) {
      td.innerHTML = '<div style="width: 100px;height: 150px;margin: 10px;background: rgba(0,0,0,.5) url(' + d[k] + ') no-repeat top;background-size: contain;"></div>';
    } else {
      td.innerHTML = d[k];
    }

    tr.appendChild(td);
  });

  tableBody.appendChild(tr);

  var number = ~~(Math.random() * (1 << 24));
  var s = number.toString(16);
  d.bgColor = '#' + '000000'.substring(s.length) + s;

  d.color = number > (1 << 23) ? '#000000' : '#ffffff';
});

var favorite = document.getElementById('favorite');
append(favorite, Handlebars.compile(Template)(JsonData));

window.handlers.btnClicked(1);

setInterval(sendMessage, 3000);