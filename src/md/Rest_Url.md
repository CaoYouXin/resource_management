

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

`Serve 2.0`使用的`Url`参数配置如下：

```
"/foo/bar/:param1?param2=:param2&param3=:param3"
```

即在`?`前后都可以配置参数。这种参数配置关系到`API`的匹配。将以上配置转化成合适的`正则表达式`即可解决。

```
StringBuilder stringBuilder = new StringBuilder();

String urlPattern = controller.urlPattern();
int start = urlPattern.indexOf(':'), end = 0, startSub = 0;
while (-1 != start) {
    stringBuilder.append(urlPattern.substring(startSub, start).replaceAll("\\?", "\\\\?"));

    end = StringUtil.indexOf(urlPattern, start, '/', '&', '?');

    String paramName;
    if (-1 == end) {
        paramName = urlPattern.substring(start + 1);
        end = urlPattern.length();
    } else {
        paramName = urlPattern.substring(start + 1, end);
    }
    this.paramNames.add(paramName);

    stringBuilder.append("(?<")
            .append(paramName)
            .append(">[^\\?&]*?)");

    start = urlPattern.indexOf(':', end);
    startSub = end;
}
if (end != urlPattern.length()) {
    stringBuilder.append(urlPattern.substring(end).replaceAll("\\?", "\\?"));
}

String regex = this.prefix + stringBuilder.toString();

logger.info("reg : " + regex);

this.pattern = Pattern.compile(regex);
```

匹配的同时记录下该Url对应的参数Map，方便`Controller`使用。然而，符合同一配置的Url的可能性是无穷的，记录下的参数Map数量也是有限的。

```
public boolean match(HttpRequest request, Map<String, String> paramsNotCache) {
    String uri = request.getRequestLine().getUri();
    String decodedUrl = RestHelper.getDecodedUrl(request);
    Matcher matcher = this.pattern.matcher(decodedUrl);
    boolean matches = matcher.matches();

    if (matches) {
        Map<String, String> params = new HashMap<>();
        for (String paramName : this.paramNames) {
            params.put(paramName, matcher.group(paramName));
        }
        if (!this.paramsCache.keySet().contains(uri)) {
            this.paramsCacheSize.add(uri);
            if (this.paramsCacheSize.size() > 100) {
                String remove = this.paramsCacheSize.remove();
                this.paramsCache.remove(remove);
            }
        }
        this.paramsCache.put(uri, params);
        if (null != paramsNotCache) {
            paramsNotCache.putAll(params);
        }
    }

    return matches;
}
```

因此，通过`方法副作用(Side Effect)`，在匹配时可以将参数储存在第二个参数Map中。这样`Controller`获取参数Map时就可以有机会重新匹配，以获取参数。

```
public Map<String, String> getParams(HttpRequest request) {
    Map<String, String> ret = this.paramsCache.get(request.getRequestLine().getUri());
    if (null == ret) {
        ret = new HashMap<>();
        if (this.match(request, ret)) {
            return ret;
        }
    }

    return ret;
}
```

结束语
---

内容虽然很简单，但确实是对Serve 2.0的记录和总结。