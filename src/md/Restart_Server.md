

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

重启服务器就是先停止再启动的一个过程，这个过程中需要注意的是：重启操作与正在运行的服务器不在同一个进程中。发送HTTP请求后，不能立刻启动新服务器，因为操作系统资源（例如端口）未能及时释放。经常出现的就是`AddressAreadyBound`错误。

在部署到正式环境中后，发生了一个bug。停止请求发出到启动之间的时间间隔相同，但是正式环境就是启动不成功。我的开发系统是Mac，而正式环境是一台配置非常差的Linux云服务器。至今没有找到问题所在，只好为两个环境设置不同的时间间隔。

```
Map<String, String> params = this.getUriPatternMatcher().getParams(request);
String downCount = params.get("downCount");

String jarFilepath = Configs.getConfigs(Configs.JAR_FILE_PATH, String.class);
BashUtil.run(String.format("nohup java -jar %s restart " + downCount, jarFilepath), false);
RestHelper.responseJSON(response, JsonResponse.success(Math.max(10, Integer.parseInt(downCount)) + 5));
```

前端发起重启请求时带`downCount`参数，而后端决定最后的时间间隔，最小为10s。最后为前端返回最终`时间间隔+5s`。

结束语
---

目前，问题很严重。因为经过多次测试，正式环境需要120s之久才能顺利重启服务器。