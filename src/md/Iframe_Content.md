

这个博客在开发初期就有一项原则：__不仅显示文章，更要自由地将页面嵌入进来当博客内容__。

更何况，这个博客最初由我自己开发的`PageSlider`支持，页面最初的结构就是`ul+iframe`。

现在更进一步，只将博客内容放在`iframe`中，其它的如首页，评论则在`iframe`外。

### Angular 4 版 template

```
<div class="iframe zi11000" [class.loading]="loading">loading...</div>
<iframe [src]="(prefix + url) | safeHtml" scrolling="no" [style.height]="height + 'px'"></iframe>
```

### react 版 template

```
(
  <div>
    <div className={calcClassName({
      "content dimmer": true,
      "loading": loading
    })}>loading...</div>
    <iframe src={getAPI('server') + '/serve' + url} scrolling="no" className="content"
      title={url} style={{ height: height + 'px' }}></iframe>
  </div>
)
```

解决的问题
---

应用`iframe`的问题有两个。

* 除非在iOS系统上，否则`iframe`是不会自动变成与其内容大小一致的
* iframe中点击链接，会把链接内容加载到`iframe`里

解决这两个问题，所使用的技术却是相同的，即`window.postMessage`，跨`iframe`通信。

### angular 4 版 事件绑定

```
@HostListener("window:message", ['$event'])
receiveMessage(e) {
  if (e.origin !== API.getAPI("server/origin")) {
    return;
  }

  let data = JSON.parse(e.data);

  if (data.path && data.height) {
    this.loadMsg(data);
  } else if (data.url && data.target) {
    this.openMsg(data);
  }
}

private openMsg(data) {
  window.open(data.url, data.target);
}

private loadMsg(data) {
  if (this.url !== data.path) {
    return;
  }

  this.height = data.height;
  this.loading = false;
}
```

### react 版 事件绑定

```
constructor(props) {
  super(props);

  this.state = {
    loading: true,
    height: 0
  };

  this.receiveMessage = this.receiveMessage.bind(this);
}

receiveMessage(e) {
  if (e.origin !== getAPI('server')) {
    return;
  }

  let data = JSON.parse(e.data);

  if (data.path && data.height) {
    this.loadMsg(data);
  } else if (data.url && data.target) {
    this.openMsg(data);
  }
}

openMsg(data) {
  window.open(data.url, data.target);
}

loadMsg(data) {
  if (this.props.url !== data.path) {
    return;
  }

  this.setState({
    loading: false,
    height: data.height
  });
}

componentWillMount() {
  window.addEventListener('message', this.receiveMessage)
}

componentWillUnmount() {
  window.removeEventListener('message', this.receiveMessage);
}
```

结束语
---

此组件的名字叫做`IframeContent`。