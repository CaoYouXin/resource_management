

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

`myJPA 1.0`中需要在`Repository`子类中调用`super.query`来达到扩展的目的，现在只需要在`Repository`子接口中定义一定规则的方法就好了。

```
public interface ITestRepo extends Repository<ITestEntity, Long> {

    ITestEntity findByTestValueOrTestId(String a, Long b);

    List<ITestEntity> findAllByTestValueOrTestId(String a, Long b);

    @Query("select a from ITestEntity a where a.TestId = $0")
    ITestEntity querySth(Long testId);

    @Query("select a from ITestEntity a")
    List<ITestEntity> querySth();

    @Query(useValue = false)
    List<ITestEntity> querySth(String query, String match);

}
```

实现
---

借助代理可以轻松实现以上功能。

```
public interface Repository<TABLE, ID> extends ChangeOriginI {

    TABLE find(ID id);
    // findByXxx

    List<TABLE> findAll();
    // findAllByXxx

    Boolean remove(ID id);
    // removeByXxx
    // softRemoveByXxxAtYyy

    Boolean save(TABLE t);

    Boolean createTableIfNotExist();

}
```

### InvocationHandler

```
@Override
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    String methodName = method.getName();
    InvocationHandler invocationHandler = this.invocationHandlerMap.get(methodName);
    if (null != invocationHandler) {
        return invocationHandler.invoke(proxy, method, args);
    }

    Query query = method.getDeclaredAnnotation(Query.class);
    if (null != query) {
        invocationHandler = this.invocationHandlerMap.get("query");
        if (null != invocationHandler) {
            return invocationHandler.invoke(proxy, method, args);
        }
    }

    if (methodName.startsWith("find")) {
        invocationHandler = this.invocationHandlerMap.get("find");
        if (null != invocationHandler) {
            return invocationHandler.invoke(proxy, method, args);
        }
    }

    if (methodName.startsWith("remove") || methodName.startsWith("softRemove")) {
        invocationHandler = this.invocationHandlerMap.get("remove");
        if (null != invocationHandler) {
            return invocationHandler.invoke(proxy, method, args);
        }
    }

    return null;
}
```

`invocationHandlerMap`中注册了各种情况的处理类。处理类中除了有同`myJPA 1.0`中一样的SQL生成、执行，返回对象填值以外，还有新的一部分就是解析方法名，从方法名中解析出所需要的列名。

对`query`的支持变得更加易用且强大。采用注解的方式声明调用`queryHandler`处理的方法。

```
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Query {

    String value() default "";

    boolean useValue() default true;

    Class<?>[] types() default {};

}
```

`query`方法有两种调用形式，可以选择把`JPA-SQL`当做方法第一个参数传递，或者写在注解中。而处理过程中用到的类会自动包含返回值的类型，如果是`List`会自动查看泛型类型。

### DDL 支持

`myJPA 2.0`会根据对象类型，生成相应的数据库列类型。

```
switch (typeName) {
    case "java.lang.Boolean":
    case "java.lang.Byte":
        return "TINYINT";
    case "java.lang.Short":
        return "SMALLINT";
    case "java.lang.Integer":
        return "INT";
    case "java.lang.Long":
        return "BIGINT";
    case "java.lang.String":
        if (column.length() <= (1 << 8) - 1) {
            return "VARCHAR(" + column.length() + ")";
        }

        if (column.length() <= (1 << 16) - 1) {
            return "TEXT";
        }

        if (column.length() <= (1 << 24) - 1) {
            return "MEDIUMTEXT";
        }

        if (column.length() <= Integer.MAX_VALUE * 2L + 1) {
            return "LONGTEXT";
        }

        throw new RuntimeException("string too long.");
    case "java.util.Date":
        return "DATETIME";
    default:
        throw new RuntimeException("not known type " + typeName);
}
```

### Repository 创建

```
public <T extends Repository> T getRepository(Class<T> proto) {
    Repository repository = this.repositories.get(proto);
    if (null != repository) {
        return proto.cast(repository);
    }

    T buildRepository = RepositoryManager.getInstance().buildRepository(proto);
    this.repositories.put(proto, buildRepository);
    return buildRepository;
}
```

`BeanManager`中对Repository对象做了缓存，实际创建过程由`RepositoryManager`管理。

```
public <T extends Repository> T buildRepository(Class<T> proto) {
    return proto.cast(Proxy.newProxyInstance(
            Configs.getConfigs(Configs.CLASSLOADER, ClassLoader.class, () -> getClass().getClassLoader()),
            new Class[]{proto},
            new RepositoryIH(proto)
    ));
}
```

结束语
---

代理模式确实很强大哈！