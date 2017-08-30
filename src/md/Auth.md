

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

`Serve 2.0`中涉及的权限验证有两个部分。

* API权限验证，在Controller接口中就能看到
* Serve资源的权限验证

权限验证都在直接绑定在`HttpServer`的`handler`中实现。除API和资源外，还有管理文件上传和关闭服务器的两个直接绑定在`HttpServer`的`handler`。

### API Handler

```
try {
    if (!AuthHelper.auth(controller.auth(), request, context)) {
        RestHelper.responseJSON(response, JsonResponse.fail(RestCode.UNAUTHED, "未授权的访问."));
        return;
    }
} catch (AuthRuntimeException e) {
    RestHelper.responseJSON(response, JsonResponse.fail(RestCode.UNAUTHED, e.getMessage()));
    return;
}
```

### Serve Handler

```
try {
    if (!serveAuth.apply(request, context)) {
        RestHelper.responseJSON(response, JsonResponse.fail(RestCode.FORBIDDEN_RESOURCE, "未授权的资源访问."));
        return;
    }
} catch (Throwable e) {
    RestHelper.catching(e, response, RestCode.FORBIDDEN_RESOURCE);
    return;
}
```

可见，两个`Handler`中当权限验证不通过时，返回的`错误码`是不同的。

### Auth的统一接口定义

```
public interface ServeAuth extends BiFunction<HttpRequest, HttpContext, Boolean> {
}
```

### 权限验证过程

一个`Controller`中可以定义多个`Auth`。这是通过位运算实现的。而多个权限验证，只需要有一个通过，则该`API`视为可以访问。

```
public static Boolean auth(int auth, HttpRequest request, HttpContext context) {
    if (0 == auth) {
        return true;
    }

    AuthRuntimeException notAuth = null;
    boolean authPass = false;
    for (int aAuth : AUTH_MAP.keySet()) {
!        if ((aAuth & auth) > 0) {
            try {
                authPass = authPass || AUTH_MAP.get(aAuth).apply(request, context);
            } catch (AuthRuntimeException e) {
                notAuth = e;
            }
        }
    }

    if (!authPass && null != notAuth) {
        throw notAuth;
    }
    return true;
}
```

结束语
---

内容虽然很简单，但确实是对Serve 2.0的记录和总结。