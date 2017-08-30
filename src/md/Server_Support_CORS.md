

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

对于跨域问题，有很多解决方法，其中一种叫做`CORS`。在浏览器发起跨域请求时带上特殊的Header，供服务器决策是否予以响应。服务器端代码如下：

```
public static void crossOrigin(HttpRequest request, HttpResponse response) {
!  response.setHeader("Access-Control-Allow-Origin", "*");

//        RestHelper.setCORS(request, "Origin",
//                response, "Access-Control-Allow-Origin");

  RestHelper.setCORS(request, "Access-Control-Allow-Method",
          response, "Access-Control-Request-Methods");

  RestHelper.setCORS(request, "Access-Control-Request-Headers",
          response, "Access-Control-Allow-Headers");

  RestHelper.setCORS(request, "Access-Control-Allow-Credentials",
          response, "Access-Control-Allow-Credentials");
}

public static void setCORS(HttpRequest httpRequest, String reqHeaderName, HttpResponse httpResponse, String resHeaderName) {
  Header[] headers = httpRequest.getHeaders(reqHeaderName);
  if (headers.length > 0) {
    logger.info(reqHeaderName + " : " + Arrays.toString(headers));
  }

  if (headers.length > 0) {
    for (Header header : headers) {
      httpResponse.setHeader(resHeaderName, header.getValue());
    }
  }
}
```

以上代码中高亮的一行表示，该服务支持其它任何域名下的前端系统访问。

结束语
---

内容虽然很简单，但是确实对Serve 1.0的一个总结和记录，并且沿用到Serve 2.0。