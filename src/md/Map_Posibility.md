做后端时，尤其是游戏后端的时候，经常会遇到概率、抽奖。刚开始傻傻不知所措，自己写的实现复杂且结构不清晰。在导师的指导下采用`java.util.TreeMap.floorKey() Method`，从此不再担心抽奖类需求。

抽奖类可以使用泛型`LotteryDrawer<Prize>`，暴露公共方法`public Prize getPrize()`。`getPrize()`内部调用`this.map.floorEntry(Math.random()).getValue()`。

```
public class LotteryDrawer<Prize> {

	private TreeMap<Double, Prize> map;

	public LotteryDrawer(TreeMap<Double, Prize> map) {
		this.map = map;
	}

	public Prize getPrize() {
		return this.map.floorEntry(Math.random()).getValue();
	}

}
```

抽奖对象的创建方式，这里总结了两类。

* 指定绝对的概率，存在不中奖的可能
* 指定互相的权重，百分百中奖

因此，抽奖对象的创建过程可以抽象成`LotteryDrawerBuilder<Prize>`类。通过构造器参数指定抽奖创建方式。

```
public LotteryDrawerBuilder(boolean mode) {
	// True 为指定绝对概率
  this.mode = mode;
}
```

抽奖对象的创建过程可以抽象为两步。

1. 暂时保存概率或权重，以及对应的奖励
2. 创建抽奖对象的核心TreeMap

为了使代码更优雅，第1步过程采用链式调用的方式，即方法返回`LotteryDrawerBuilder`对象本身。

```
public LotteryDrawerBuilder<Prize> add(double d, Prize p) {
  this.ds.add(d);
  this.ps.add(p);

  return this;
}
```

第2步过程根据`mode`不同会有所差异

* 指定绝对概率的模式下，必须同时指定不中奖的情况
* 指定绝对概率的模式下，所有概率总和不能大于1

```
public LotteryDrawer<Prize> build(Prize defaultPrize) {
  if (this.mode) {
    return this.buildModeTrue(defaultPrize);
  }

  return this.buildModeFalse();
}
```

先看指定绝对概率的情况，必须检查总和，否则终止创建过程。

```
private LotteryDrawer<Prize> buildModeTrue(Prize p) {
  if (null == p) {
    throw new RuntimeException("指定绝对概率的模式下，必须同时指定不中奖的情况。");
  }

  double total = 0;
  TreeMap<Double, Prize> map = new TreeMap<>();
  for (int i = 0; i < this.ds.size(); i++) {
    map.put(total, this.ps.get(i));
    total += this.ds.get(i);
    if (total > 1) {
      throw new RuntimeException("指定绝对概率的模式下，所有概率总和不能大于1。");
    }
  }
  map.put(total, p);

  return new LotteryDrawer<Prize>(map);
}
```

再看指定权重的情况，必须首先计算权重总和，再分配概率。

```
private LotteryDrawer<Prize> buildModeFalse() {
  double total = 0;
  for (int i = 0; i < this.ds.size(); i++) {
    total += this.ds.get(i);
  }

  TreeMap<Double, Prize> map = new TreeMap<>();
  double mapTotal = 0;
  for (int i = 0; i < this.ds.size(); i++) {
    map.put(mapTotal, this.ps.get(i));
    mapTotal += this.ds.get(i) / total;
  }

  return new LotteryDrawer<Prize>(map);
}
```

最后是Client代码。

```
LotteryDrawer<String> ins1 = new LotteryDrawerBuilder<String>(true)
    .add(0.5, "中奖")
    .build("未中奖");
System.out.println(ins1.getPrize());

LotteryDrawer<String> ins2 = new LotteryDrawerBuilder<String>(false)
    .add(0.1, "中-大奖")
    .add(0.3, "中-中奖")
    .add(0.5, "中-小奖")
    .build(null);
System.out.println(ins2.getPrize());
```

其中一次的调用结果如下。

```
中奖
中中奖
```