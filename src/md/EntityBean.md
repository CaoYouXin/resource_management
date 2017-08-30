

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

本篇文章说明使用接口编程，由`BeanManager`管理创建过程的`EntityBean`。核心思想是使用代理，通过类型转换就可以支持不同属性的存取。而代理对象则是一个通用的`Map<String, Object>`。

`EntityBean`支持与`Json`字符串的转换，以及与其它`EntityBean`的复制。

```
public interface EntityBeanI {

    String toJSONString();

    void fromJSON(String json);

    Map<String, Object> toMap();

    void fromMap(Map<String, Object> map);

    void copyFrom(EntityBeanI entityBeanI);

    void copyFrom(EntityBeanI entityBeanI, Class<?> template);

    void copyFromInclude(EntityBeanI entityBeanI, String... includeKeys);

    void copyFromExclude(EntityBeanI entityBeanI, String... excludeKeys);

}
```

以上是`EntityBean`的接口定义，只有实现了以上接口才是可以被`BeanManager`管理的`Bean`。实现依然在`InvocationHandler`中。

实现
---

```
public class DataAccessIH implements InvocationHandler {

    private Map<String, Object> data = new HashMap<>();

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        String name = method.getName();
        if (name.startsWith("get")) {
            Object value = this.data.get(name.substring("get".length()));

            if (null == value) {
                return null;
            }

!            switch (method.getReturnType().getTypeName()) {
!                case "java.util.Date":
!                    if (value instanceof Date) {
!                        return value;
!                    }
!
!                    DateFormat dateFormat = Configs.getConfigs(Configs.DATE_FORMAT, DateFormat.class, () -> {
!                        DateFormat fallback = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
!                        fallback.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
!
!                        return fallback;
!                    });
!                    return dateFormat.parse((String) value);
!                case "java.lang.Long":
!                    if (value instanceof Long) {
!                        return value;
!                    }
!
!                    if (value instanceof Integer) {
!                        return Long.parseLong(Integer.toString((Integer) value));
!                    }
!
!                    if (value instanceof String) {
!                        return Long.parseLong((String) value);
!                    }
!
!                    throw new RuntimeException("value is not a number type.");
!                case "java.lang.Byte":
!                    if (value instanceof Byte) {
!                        return value;
!                    }
!
!                    if (value instanceof Integer) {
!                        return Byte.parseByte(Integer.toString((Integer) value));
!                    }
!
!                    if (value instanceof String) {
!                        return Byte.parseByte((String) value);
!                    }
!
!                    throw new RuntimeException("value is not a number type.");
!                default:
!                    return value;
!           }
        }

        if (name.startsWith("set")) {
            this.data.put(name.substring("set".length()), args[0]);
            return null;
        }

        if (name.startsWith("is")) {
            return this.data.get(name.substring("is".length()));
        }

        if (name.equals("toMap")) {
            Map<String, Object> data = this.data;

            for (String key : data.keySet()) {
                Object value = data.get(key);

                if (value instanceof EntityBeanI) {
                    data.put(key, ((EntityBeanI) value).toMap());
                }

                if (value instanceof List) {
                    data.put(key, ((List) value).stream().map(obj -> {
                        if (obj instanceof EntityBeanI) {
                            return ((EntityBeanI) obj).toMap();
                        }
                        return obj;
                    }).collect(Collectors.toList()));
                }
            }

            return Collections.unmodifiableMap(data);
        }

        if (name.equals("fromMap")) {
            this.data = (Map<String, Object>) args[0];
            return null;
        }

        if (name.equals("toJSONString")) {
            ObjectMapper objectMapper = Configs.getConfigs(Configs.OBJECT_MAPPER, ObjectMapper.class, () -> new ObjectMapper());
            return objectMapper.writeValueAsString(this.data);
        }

        if (name.equals("fromJSON")) {
            ObjectMapper objectMapper = Configs.getConfigs(Configs.OBJECT_MAPPER, ObjectMapper.class, () -> new ObjectMapper());
            this.data = objectMapper.readValue((String) args[0], Map.class);
            return null;
        }

        if (name.equals("copyFrom")) {
            Map<String, Object> copyFrom = ((EntityBeanI) args[0]).toMap();
            if (args.length == 1) {
                this.data.putAll(copyFrom);
                return null;
            }
            if (args.length == 2) {
                this.data.putAll(this.filter(copyFrom, (Class<?>) args[1]));
                return null;
            }
        }

        if (name.equals("copyFromInclude")) {
            this.data.putAll(this.filter(args, true));
            return null;
        }

        if (name.equals("copyFromExclude")) {
            this.data.putAll(this.filter(args, false));
            return null;
        }

        return null;
    }

    private Map<String, Object> filter(Map<String, Object> source, Class<?> template) {
        Map<String, Object> ret = new HashMap<>();
        for (Method method : template.getMethods()) {
            if (!method.getName().startsWith("set")) {
                continue;
            }

            String key = StringUtil.cutPrefix(method.getName(), "set");
            ret.put(key, source.get(key));
        }
        return ret;
    }

    private Map<String, Object> filter(Object[] args, boolean includeMode) {
        Map<String, Object> ret = new HashMap<>();
        Map<String, Object> source = ((EntityBeanI) args[0]).toMap();

        List<String> keyList = Arrays.asList((String[]) args[1]);

        for (String key : source.keySet()) {
            boolean contains = keyList.contains(key);

            if (includeMode == contains) {
                ret.put(key, source.get(key));
            }
        }
        return ret;
    }

}
```

以上高亮部分的实现，使`EntityBean`支持存取类型不相同的情况，类型转化由`InvocationHandler`处理。

### BeanManager.createBean

```
public <T extends EntityBeanI> T createBean(Class<T> clazz) {
    ClassLoader classLoader = Configs.getConfigs(Configs.CLASSLOADER, ClassLoader.class, () -> getClass().getClassLoader());
    return clazz.cast(Proxy.newProxyInstance(
            classLoader,
            new Class[]{clazz},
            new DataAccessIH()
    ));
}

public <T extends EntityBeanI> T createBean(Class<T> clazz, String json) {
    T t = this.createBean(clazz);
    t.fromJSON(json);
    return t;
}
```

### Client代码

这种`Bean`创建方式下的`Client`代码如下：

```
Entity1 bean = BeanManager.getInstance().createBean(Entity1.class);
bean.setA("aaa");
assertEquals("aaa", bean.getA());
bean.setA("aba");
assertEquals("aba", bean.getA());

Entity2 bean2 = Entity2.cast(bean);
bean2.setB("bbb");
assertEquals("bbb", bean.getB());
assertEquals("aba", bean.getA());
```

`Entity1`定义如下：

```
public interface Entity1 extends EntityBeanI {

    String getA();

    void setA(String a);

}
```

`Entity2`定义如下：

```
public interface Entity2 extends Entity1 {

    String getB();

    void setB(String b);

}
```

结束语
---

这种对象的使用方式，是不是很灵活呢？！