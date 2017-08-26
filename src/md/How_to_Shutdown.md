
我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

首先，简单回顾网络编程基础
---

网络编程基于`Socket`进行编程，有两种选择。

1. 阻塞式。每个`Worker线程`处理一个Socket连接，通常使用线程池技术使`Worker线程`可以被重用。这种模式适合并发量不太大的场景。
2. 非阻塞式。也就是事件分发机制的一种应用。`ServerSocket`分发各种事件，`Worker线程`进行处理。这种模式更好地支持高并发。

基于`Socket`进行编程，工作在`TCP/UDP`层面，而我要实现的目标`Web应用服务器`属基于`TCP`的`HTTP`协议。( **_That's RIGHT!_** )
在这里我还是偷了个懒，使用`HttpCore`来处理`HTTP`协议内容。( **_之后，我发现一偷懒就停不下来，直接使用HttpCore创建HttpSocket了。_** )

OK，回顾结束
---

现在开始进入正题：__如何关闭ServerSocket服务，如何重启？__

在这里，首要考虑的问题是 __安全性__ 。比如，不能让服务器被一条GET请求给关闭。我的思路是这样的：

* 服务器只能被来自本机的`请求`关闭，即通过`内部接口`关闭。
<!-- * 通过`外部接口`关闭服务器时，需要提供额外的权限认证。 -->

基于以上两点，我开发的程序在启动服务器时创建一个日志，记录一个特殊的`Token`，用作`内部接口`验证步骤。任何对已经正常启动的服务发送该`请求`并附加正确的`Token`，即可关闭服务器。

```
this.serverBootstrap = ServerBootstrap.bootstrap()
      .setListenerPort(port)
      .setServerInfo("Test/1.1")
      .setSocketConfig(socketConfig)
      .setExceptionLogger(new StdErrorExceptionLogger())
      .registerHandler("/hook.cfg", new CfgHandler())
!      .registerHandler("/shutdown.cmd", new ShutDownHandler(this))
      .registerHandler("*", new ProxyHandler(new HttpFileHandler(docRoot, "")));
```

`ShutDownHandler`构造器传入`HTTPServer`对象，使其可以关闭服务器。

```
private SimpleServer server;

public ShutDownHandler(SimpleServer server) {
  this.server = server;
}
```

`ShutDownHandler`的`handle`方法，处理验证、关闭，并返回信息。

```
if (!HttpUtils.isGet(httpRequest)) {
  throw new MethodNotSupportedException(HttpUtils.getMethod(httpRequest) + " method not supported");
}

String decodedUrl = HttpUtils.getDecodedUrl(httpRequest);
int indexOf = decodedUrl.indexOf("?token=");
if (-1 != indexOf) {
  String token = decodedUrl.substring(indexOf + "?token=".length());

!  ConfigUtil util = new ConfigUtil();
!  ShutDownConfig config = util.getConfigFromFile(util.getRootFileName() + ".log", ShutDownConfig.class);

  if (token.equals(config.getToken())) {
    HttpUtils.response(httpResponse, new JsonRes(Constants.CODE_VALID));
    this.server.shutdown();
  }
} else {
  throw new RuntimeException("To shutdown, one must follow the correct format of url [/shutdown.cmd?token=TOKEN].");
}
```

`ConfigUtil`可以读写日志，功能类似`localstorage+JSON`。这里是读取日志，以对比`请求`中的Token是否正确。

以上即关闭服务器的请求处理的相关代码和说明

管理服务器
---

最初考虑整套服务的架构时，觉得应该采用微服务架构。通过良好的层次规划、暴露合理的接口实现完美的调用结构。所以，对于众多的微服务服务器的启动、关闭、重启，就需要一个专门的服务来管理。管理服务器悉知各服务器的文件路径，可以读取其日志，所以做到了 __*服务器只能被来自本机的`请求`关闭，即通过`内部接口`关闭*__ 。

更进一步
---

如果说可以读到其日志的程序就被认为是合法的可以关闭服务器的程序，那么为什么不把这个任务交给它自己呢？通过对每个服务器程序的命令行启动参数做处理，传入`start`为启动，传入`stop`为关闭，来自己管理自己的启动。

```
public static void main(String[] args, CallBack start, CallBack stop) {
  if (args.length < 1) {
    throw new RuntimeException("arguments less than 1.");
  }

  switch (args[0]) {
    case "start":
        start.call();
        break;
    case "stop":
        stop.call();
        break;
    default:
        throw new RuntimeException("can not understand command : " + args[0]);
  }
}
```

虽说如此，但每次调用`java -jar xxx.jar xxx`都会创建一个独立的进程，所以并不能跳过以`请求`的方式来关闭服务器。

这时，管理服务器就可以真正的管理微服务各服务器的启动和关闭了，只需要调用`shell`。

```
switch (aDo) {
  case "start":
    SimpleUtils.run("nohup java -jar " + target + " start &", false);
    break;
  case "stop":
    SimpleUtils.run("nohup java -jar " + target + " stop &", false);
    break;
  default:
    throw new RuntimeException("can not understand request " + aDo);
}
```