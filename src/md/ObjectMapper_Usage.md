

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

在记录日志的时候，面向`POJO`编程，自然想到`Json`。根据之前的工作经验，自然选择了`Jackson`类库。主要使用了两个方法：

* public <T> T `readValue`(String content, Class<T> valueType) throws IOException, JsonParseException, JsonMappingException
* public String `writeValueAsString`(Object value) throws JsonProcessingException

在Serve 1.0项目中的主要应用包括：

1. `ConfigUtil`
2. `HttpUtils.getBodyAsObject`
3. `JsonRes<T>`

一个一个来看
---

### ConfigUtil

配置的读写就是利用上述`ObjectMapper`的两个方法。需要说明的一点是配置的文件路径问题。通过以下代码获取路径：

```
getClass().getProtectionDomain().getCodeSource().getLocation().getFile()
```

通常获取的路径是`class文件`所在路径去掉包名类名之后的文件夹的绝对路径。但如果是启动`jar文件`的话，则是包含`jar文件`名的绝对路径。

### HttpUtils.getBodyAsObject

```
public static <T> T getBodyAsObject(HttpRequest httpRequest, Class<T> clazz) {
  String bodyAsString = getBodyAsString(httpRequest);
  try {
!    return OBJECT_MAPPER.readValue(bodyAsString, clazz);
  } catch (IOException e) {
    logger.catching(e);
    throw new RuntimeException(e);
  }
}
```

`getBodyAsString`留到另一篇相关的文章里说明。

### JsonRes<T>

```
private int code;
private T body;

public JsonRes(int code) {
  this.code = code;
}

public JsonRes(int code, T body) {
  this.code = code;
  this.body = body;
}

@Override
public String toString() {
  try {
!    return HttpUtils.OBJECT_MAPPER.writeValueAsString(this);
  } catch (JsonProcessingException e) {
    logger.catching(e);
  }
  return "JsonRes{" +
        "code=" + code +
        ", body=" + body +
        '}';
}
```

JsonRes还有一些方便的创建方式：

```
public static JsonRes SuccessJsonRes = new JsonRes(Constants.CODE_VALID);

public static JsonRes getSuccessJsonRes(String message) {
  return new JsonRes<>(Constants.CODE_VALID, message);
}

public static JsonRes getFailJsonRes(int code, String reason) {
  return new JsonRes<>(code, reason);
}

public static JsonRes getFailJsonRes(String reason) {
  return new JsonRes<>(Constants.CODE_INVALID, reason);
}
```

结束语
---

内容虽然很简单，但是确实对Serve 1.0的一个总结和记录。