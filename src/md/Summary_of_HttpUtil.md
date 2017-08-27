

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

在处理`HTTP请求`的时候，通常有四个步骤：

1. 解析`HTTP Method`
2. 解析`URL`
3. 解析`HTTP Body`
4. 返回数据

针对这四项常用内容，编写了`HTTPUtil`。

解析`HTTP Method`
---

```
public static String getMethod(HttpRequest httpRequest) {
  return httpRequest.getRequestLine().getMethod().toUpperCase(Locale.ROOT);
}

public static boolean isGet(HttpRequest httpRequest) {
  return getMethod(httpRequest).equals("GET");
}

public static boolean isPost(HttpRequest httpRequest) {
  return getMethod(httpRequest).equals("POST");
}

public static boolean isOptions(HttpRequest httpRequest) {
  return getMethod(httpRequest).equals("OPTIONS");
}
```

解析`URL`
---

```
public static String getDecodedUrl(HttpRequest httpRequest) {
  try {
    return URLDecoder.decode(httpRequest.getRequestLine().getUri(), "UTF-8");
  } catch (UnsupportedEncodingException e) {
    logger.catching(e);
    return "";
  }
}
```

通常传给服务器的URL分两部分，`路径`和`参数`。针对这两部分，分别提供工具方法。

```
public static String getSimpleDecodedUrl(HttpRequest httpRequest) {
  String decodedUrl = getDecodedUrl(httpRequest);
  int indexOf = decodedUrl.indexOf('?');
  if (-1 == indexOf) {
    return decodedUrl;
  } else {
    return decodedUrl.substring(0, indexOf);
  }
}
```

```
public static Map<String, String> getParameterMap(HttpRequest httpRequest) {
  Map<String, String> ret = new HashMap<>();

  String decodedUrl = getDecodedUrl(httpRequest);
  int indexOf = decodedUrl.indexOf('?');
  if (-1 == indexOf) {
    return ret;
  }

  putParameter(decodedUrl.substring(indexOf + 1), ret, "&");
  return ret;
}

private static void putParameter(String str, Map<String, String> map, String delimiter) {
  int indexOf = str.indexOf(delimiter), indexOfEqual = str.indexOf('=');
  if (-1 != indexOf) {
    if (-1 != indexOfEqual) {
      map.put(str.substring(0, indexOfEqual),
              str.substring(indexOfEqual + 1, indexOf));
      putParameter(str.substring(indexOf + delimiter.length()), map, delimiter);
    }
  } else {
    if (-1 != indexOfEqual) {
      map.put(str.substring(0, indexOfEqual), str.substring(indexOfEqual + 1));
    }
  }
}
```

获取参数的时候利用递归逐渐消耗URL字符串，是一个线性的算法。另外，参数中还有一种数组的类型，算法类似。

```
public static List<String> getParameterList(String param) {
  List<String> ret = new ArrayList<>();
  int indexOf = param.indexOf(',');
  putParameter(param, ret, indexOf);
  return ret;
}

private static void putParameter(String str, List<String> list, int indexOf) {
  if (-1 == indexOf) {
    list.add(str);
  } else {
    list.add(str.substring(0, indexOf));
    String next = str.substring(indexOf + 1);
    putParameter(next, list, next.indexOf(','));
  }
}
```

解析`HTTP Body`
---

```
public static HttpEntity getBody(HttpRequest httpRequest) {
  if (httpRequest instanceof HttpEntityEnclosingRequest) {
    return ((HttpEntityEnclosingRequest) httpRequest).getEntity();
  }
  return null;
}
```

作为工具方法，`HttpUtil`还可以将`HttpEntity`转化成`String`、`byte[]`、`Object`。

```
public static String getBodyAsString(HttpRequest httpRequest) {
  HttpEntity entity = getBody(httpRequest);
  if (null != entity) {
    try {
      return EntityUtils.toString(entity, Consts.UTF_8);
    } catch (IOException e) {
      logger.catching(e);
    }
  }
  return "";
}

public static byte[] getBodyAsBytes(HttpRequest httpRequest) {
  HttpEntity entity = getBody(httpRequest);
  if (null != entity) {
    try {
      return EntityUtils.toByteArray(entity);
    } catch (IOException e) {
      logger.catching(e);
    }
  }
  return new byte[0];
}

public static <T> T getBodyAsObject(HttpRequest httpRequest, Class<T> clazz) {
  String bodyAsString = getBodyAsString(httpRequest);
  try {
    return OBJECT_MAPPER.readValue(bodyAsString, clazz);
  } catch (IOException e) {
    logger.catching(e);
    throw new RuntimeException(e);
  }
}
```

返回数据
---

```
public static void response(HttpResponse httpResponse, String jsonString) {
  httpResponse.setStatusCode(HttpStatus.SC_OK);
  logger.info("returning --->" + jsonString);
  httpResponse.setEntity(new StringEntity(
    jsonString,
    ContentType.APPLICATION_JSON
  ));
}

public static void response(HttpResponse httpResponse, JsonRes jsonRes) {
  httpResponse.setStatusCode(HttpStatus.SC_OK);
  try {
    String retString = OBJECT_MAPPER.writeValueAsString(jsonRes);
    response(httpResponse, retString);
  } catch (JsonProcessingException e) {
    logger.catching(e);
    httpResponse.setStatusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR);
  }
}
```

结束语
---

内容虽然很简单，但是确实对Serve 1.0的一个总结和记录，并且沿用到Serve 2.0。