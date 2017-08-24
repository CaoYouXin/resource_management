
我的目标是：__从头编写Web应用服务器，不使用Struts，Spring，Hibernate!__

首先，简单回顾网络编程基础。网络编程基于`Socket`进行编程，有两种选择。

1. 阻塞式。每个`Worker线程`处理一个Socket连接，通常使用线程池技术使`Worker线程`可以被重用。这种模式适合并发量不太大的场景。
2. 非阻塞式。也就是事件分发机制的一种应用。`ServerSocket`分发各种事件，`Worker线程`进行处理。这种模式更好地支持高并发。

基于`Socket`进行编程，工作在`TCP/UDP`层面，而我要实现的目标`Web应用服务器`属基于`TCP`的`HTTP`协议。( **_That's RIGHT!_** )
在这里我还是偷了个懒，使用`HttpCore`来处理`HTTP`协议内容。( **_之后，我发现一偷懒就停不下来，直接使用HttpCore创建HttpSocket了。_** )

OK，回顾结束。现在开始进入正题：__如何关闭ServerSocket服务，如何重启？__

在这里，首要考虑的问题是 __安全性__ 。比如，不能让服务器被一条GET请求给关闭。我的思路是这样的：

* 服务器只能被来自本机的`请求`关闭，即通过`内部接口`关闭。
* 通过`外部接口`关闭服务器时，需要提供额外的权限认证。

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
