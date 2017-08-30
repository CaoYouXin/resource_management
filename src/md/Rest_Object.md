

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

方法参数注入
---

在`MVC`框架的应用上，`Serve 1.0`可以做到`Controller`方法参数注入。

```
Object ret = null;
try {

    List<Object> parameters = new ArrayList<>();
    for (Class<?> clazz : this.method.getParameterTypes()) {
        String typeName = clazz.getTypeName();
        switch (typeName) {
            case "org.apache.http.HttpRequest":
                parameters.add(request);
                break;
            case "org.apache.http.HttpResponse":
                parameters.add(response);
                break;
            case "org.apache.http.protocol.HttpContext":
                parameters.add(context);
                break;
            case "java.util.Map":
                parameters.add(HttpUtils.getParameterMap(request));
                break;
            default:
                parameters.add(HttpUtils.getBodyAsObject(request, clazz));
                break;
        }
    }

    switch (parameters.size()) {
        case 0:
            ret = this.method.invoke(this.object);
            break;
        case 1:
            ret = this.method.invoke(this.object, parameters.get(0));
            break;
        case 2:
            ret = this.method.invoke(this.object, parameters.get(0), parameters.get(1));
            break;
        case 3:
            ret = this.method.invoke(this.object, parameters.get(0), parameters.get(1), parameters.get(2));
            break;
        case 4:
            ret = this.method.invoke(this.object, parameters.get(0),
                    parameters.get(1), parameters.get(2), parameters.get(3));
            break;
        case 5:
            ret = this.method.invoke(this.object, parameters.get(0), parameters.get(1),
                    parameters.get(2), parameters.get(3), parameters.get(4));
            break;
        default:
            throw new RuntimeException("始料未及. parameter count = " + parameters.size());
    }
} catch (IllegalAccessException | InvocationTargetException e) {
    logger.catching(e);
}

if (ret != null) {
    HttpUtils.response(context, ret);
}
```

这里做了一个指定，请求体中的`JSON`对象必须有对应的`Class`，所以`Map`类型就只会代表`URL`中的参数。

`Handler`绑定
---

`Controller`采用注解声明，在服务器启动前绑定好`Handler`。

```
public RestHelper addRestObject(Object object) {
    Rest rest = object.getClass().getDeclaredAnnotation(Rest.class);

    if (null == rest) {
        throw new RuntimeException("not a rest object.");
    }

    logger.info("parsing @ " + object.getClass().getName());
    for (Method method : object.getClass().getMethods()) {
        RestAPI restAPI = method.getDeclaredAnnotation(RestAPI.class);

        if (restAPI != null) {
            logger.info("serving @ " + restAPI.url());
            this.simpleServer.registerHandler(restAPI.url(), new ProxyHandler(
                new RestHandler(object, method, restAPI)
            ));
        }
    }
    logger.info("parsing finished @ " + object.getClass().getName());

    return this;
}
```

采用链式调用模式，使`Client`代码看起来更简洁。

```
RestHelper restHelper = new RestHelper(simpleServer);
restHelper.addRestObject(new CategoryController())
        .addRestObject(new PostController())
        .addRestObject(new SearchController())
        .addRestObject(new FeedbackController());
```

结束语
---

内容虽然很简单，但是确实对Serve 1.0的一个总结和记录，并且沿用到Serve 2.0。