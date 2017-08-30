

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

对`Serve 2.0`提出了新的要求，动态加载API，如果接口不变，还需要动态更新。这都需要一个对象管理机制做支撑。

思路
---

通过代理，为用户返回代理类。当需要替换实现时，只需要替换代理对象。

实现
---

代理对象都需要实现的接口，调用则替换代理对象。

```
public interface ChangeOriginI {

    default void changeOrigin(Object obj) {
        LogManager.getLogger(ChangeOriginI.class).info("change origin : " + obj);
    }

}
```

`InvocationHandler`代理实现。

```
public class ChangeOriginIH implements InvocationHandler {

    protected Object object;

    public ChangeOriginIH(Object object) {
        this.object = object;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if (method.getName().equals("changeOrigin")) {
            this.object = args[0];
        }

        if (null != this.object) {
            return method.invoke(this.object, args);
        }

        throw new BeanNotInitException("proxy object is null.");
    }
}
```

拓展
---

`Serve 2.0`中，`Bean`有很多种，依照`MVC`和`JPA`的习惯命名方式，分为`Controller`，`Service`，`Repository`。关于最后一类的说明将在分类`myJPA 2.0`中。另外还有两类特殊的`Bean`，`Config`，`EntityBean`。前者将在文章末尾说明，后者将在另一篇文章里说明。

### Controller

此`Controller`的设计，依照粒度最细化原则，所有`Controller`实现同一接口，每个实例服务一个`API`。

```
public interface Controller extends ChangeOriginI, HttpRequestHandler {

    default int auth() {
        return 0;
    }

    String name();

    String urlPattern();

    IUriPatternMatcher getUriPatternMatcher();

    void setUriPatternMatcher(IUriPatternMatcher uriPatternMatcher);

}
```

`BeanManager`对`Controller`的管理分为set和get两个部分。

#### Controller setter

首先，创建`Controller`对象，`name`是唯一主键，检查该`name`的`Controller`是否已经被创建。若已被创建，则替换代理对象；若未被创建，则新创建代理。该方法返回`Controller`主键`name`。

```
public <T extends Controller> String setController(Class<T> controllerClass) {
    T t = null;
    try {
        t = controllerClass.newInstance();
    } catch (InstantiationException | IllegalAccessException e) {
        logger.catching(e);
        return null;
    }

    Controller controller = this.controllers.get(t.name());
    if (null != controller) {
        controller.changeOrigin(t);
        return t.name();
    }

    Object ret = Proxy.newProxyInstance(
            Configs.getConfigs(Configs.CLASSLOADER, ClassLoader.class, () -> getClass().getClassLoader()),
            new Class[]{Controller.class},
            new ChangeOriginIH(t)
    );
    this.controllers.put(t.name(), (Controller) ret);
    return t.name();
}
```

#### Controller getter

同样，检查该主键`Controller`是否已经创建。若已创建，则返回创建好的代理；若未创建，则创建一个代理对象为空的代理返回。当使用代理对象为空的`Controller`时，将会抛出异常。

```
public Controller getController(String name) {
    Controller controller = this.controllers.get(name);

    if (null != controller) {
        return controller;
    }

    Object ret = Proxy.newProxyInstance(
            Configs.getConfigs(Configs.CLASSLOADER, ClassLoader.class, () -> getClass().getClassLoader()),
            new Class[]{Controller.class},
            new ChangeOriginIH(null)
    );
    this.controllers.put(name, (Controller) ret);
    return (Controller) ret;
}
```

### Service

`Service`的接口由业务而定，正因为其自由性，当改变接口时，不能顺利替换代理对象（我一直在想，`cglib`能不能解决这个问题捏？）。`BeanManager`对`Service`的管理同样分为set和get两个部分。

#### Service setter

实现逻辑同`Controller`相似，只不过多一步检查实现类是否与已创建的`Service`使用的实现类相同的过程。

```
public <T extends Service, Impl extends T> void setService(Class<T> serviceClass, Class<Impl> serviceImplClass) {
    Class<? extends Service> cachedImplClass = this.serviceCache.get(serviceClass);
    if (serviceImplClass.equals(cachedImplClass)) {
        return;
    }
    this.serviceCache.put(serviceClass, serviceImplClass);

    T t = null;
    try {
        t = serviceImplClass.newInstance();
    } catch (InstantiationException | IllegalAccessException e) {
        logger.catching(e);
        return;
    }

    Service service = this.services.get(serviceClass);
    if (null != service) {
        service.changeOrigin(t);
        return;
    }

    Object ret = Proxy.newProxyInstance(
            Configs.getConfigs(Configs.CLASSLOADER, ClassLoader.class, () -> getClass().getClassLoader()),
            new Class[]{serviceClass},
            new ServiceIH(t)
    );
    this.services.put(serviceClass, (Service) ret);
}
```

#### Service getter

实现逻辑与`Controller`完全相同。

```
public <T extends Service> T getService(Class<T> serviceClass) {
    Service service = this.services.get(serviceClass);

    if (null != service) {
        return serviceClass.cast(service);
    }

    Object ret = Proxy.newProxyInstance(
            Configs.getConfigs(Configs.CLASSLOADER, ClassLoader.class, () -> getClass().getClassLoader()),
            new Class[]{serviceClass},
            new ServiceIH(null)
    );
    this.services.put(serviceClass, serviceClass.cast(ret));
    return serviceClass.cast(ret);
}
```

### Config

`Config`是对`Map<String, Object>`的包装。返回指定类型的对象，函数签名为：

```
public static <T> T getConfigs(String key, Class<T> clazz)
```

同时，有一个重载的函数，可以指定当`Map`中不存在该对象时的返回值`defaultValue`。

```
public static <T> T getConfigs(String key, Class<T> clazz, Callable<T> fallback) {
    Object ret = CONFIGS.get(key);
    if (null == ret && null != fallback) {
        try {
            ret = fallback.call();
        } catch (Exception e) {
            logger.catching(e);
        }
    }
    return clazz.cast(ret);
}
```

结束语
---

对象管理虽然不像Spring那样复杂，却也满足现有需求：在接口不变的情况下，可以替换实现。