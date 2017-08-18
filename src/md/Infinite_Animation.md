有一次，电脑风扇狂转，还以为机器有问题了。Google一搜才发现是一个CSS属性的问题。作为一篇总结，先系统介绍下CSS Animation。

```
/* @keyframes duration | timing-function | delay | 
iteration-count | direction | fill-mode | play-state | name */
animation: 3s ease-in 1s 2 reverse both paused slidein;

/* @keyframes duration | timing-function | delay | name */
animation: 3s linear 1s slidein;

/* @keyframes duration | name */
animation: 3s slidein;
```

animation属性是缩写，全部属性如下：

* animation-name: none
* animation-duration: 0s
* animation-timing-function: ease
* animation-delay: 0s
* animation-iteration-count: 1
* animation-direction: normal
* animation-fill-mode: none
* animation-play-state: running

以上列表中还列出了每个属性的初始值。需要特别说明的有3个：

* animation-direction: CSS动画是可以倒着播放的，甚至可以来回播放，这里神奇的属性值有 `reverse`、`alternate`、`alternate-reverse`
* animation-fill-mode: 这个属性决定CSS动画在执行动画 `之前/之后` 时候保持 `第一/最后` 关键帧的CSS样式。
  * forwards: 动画之后保持最后一帧，最后一帧由 `动画播放方向` 和 `循环次数` 共同决定
  * backwards: 动画之前保持第一帧，从动画属性生效开始，持续 `动画延迟` 指定的时长
  * both: 同时具备 forwards 和 backwards 的行为
* animation-play-state: CSS动画的播放状态也是可以控制的，状态有 `paused`，`running`

而风扇狂转的问题就来自 `animation-iteration-count` 属性。

```
animation-iteration-count: infinite;
```

这个问题并不能彻底解决，只能优化一些些性能。即向3D加速方向考虑。

```
backface-visibility: hidden;
```

另外，可以在做平移、旋转、缩放的时候，指定Z轴以应用3D加速。