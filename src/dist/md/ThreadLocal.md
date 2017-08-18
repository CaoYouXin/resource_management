不管是`J2EE`中的`Servlet`还是`Http Core`中的`HttpRequestHandler`，都是线程不安全的。以前工作过的一家公司，自主研发了游戏服务器，其`Controller`依然是线程不安全的。可见，从事Web编程中，这些线程不安全类是必然。为了解决这个问题，JDK中有两个很方便的工具。

* ThreadLocal类
* java.util.concurrent包

`ThreadLocal`使用泛型，可以存取线程相关的任何类类型对象。

```
ThreadLocal<String> tl1 = new ThreadLocal<>();
tl1.set("this is tl1");
System.out.println(tl1.get());
```

`ThreadLocal`还可以指定初始值。

```
ThreadLocal<String> tl2 = ThreadLocal.withInitial(() -> "this is tl2");
System.out.println(tl2.get());
```

`ThreadLocal`类的底层实现依赖`Thread`类。`Thread`类中有包访问权限的成员变量`ThreadLocal.ThreadLocalMap threadLocals`，这个成员变量的创建由`ThreadLocal`类负责，在`ThreadLocal`类第一次使用时创建。而`ThreadLocal`类每次通过`Thread.currentThread()`获取应该操作的`Thread`对象。`ThreadLocalMap`底层实现是一个`HashMap`，`Entry`是弱引用`WeakReference<ThreadLocal<?>>`，因此Client代码中的`ThreadLocal`对象销毁时，不会造成内存泄露。

相比`ThreadLocal`这种处理方式，`concurrent`包的思路是赋予数据结构被多线程访问的能力。

```
Collection<Object> sc = Collections.synchronizedCollection(new ArrayList<>());
List<Object> sl = Collections.synchronizedList(new ArrayList<>());
Map<Object, Object> sm = Collections.synchronizedMap(new HashMap<>());
Set<Object> ss = Collections.synchronizedSet(new HashSet<>());
```

`Collections`是一个工具类，通过装饰模式创建`concurrent`对象。另外，`Collections`还提供另一套装饰方式，使数据结构变得不可变。

```
Collection<Object> uc = Collections.unmodifiableCollection(new ArrayList<>());
List<Object> ul = Collections.unmodifiableList(new ArrayList<>());
Map<Object, Object> um = Collections.unmodifiableMap(new HashMap<>());
Set<Object> us = Collections.unmodifiableSet(new HashSet<>());
```
