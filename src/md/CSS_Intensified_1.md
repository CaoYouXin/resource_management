

卷首语
---

通过一段时间的资料收集，发现目前我在前端这块存在的短板。浏览器兼容性、预处理语言以及高性能。性能方面粗劣地讲有两条路可走，一是提高代码本身的性能，可以通过Chrome的网页性能Profile来定位问题并解决；二是使用CDN。另外两方面其实归根结底就是CSS，最初写前端的时候喜欢用UI框架，导致HTML和CSS不是很熟；现在使用AngularJS、React，似乎CSS预处理器又不是很有必要。思来想去，决定给所有标准CSS属性来个总结与提升。

规划
---

计划分三部分对CSS做出总结：

* 我所常用的CSS属性
* 并不熟悉的CSS属性
* CSS中的各种单位

分类
---

我将平时代码中常用到的CSS属性分为6类：布局相关，边框，文字，背景，动画和其它。

### 布局相关

`display`, `margin`, `padding`, `width`, `height`, `max-width`, `max-height`, `min-width`, `min-height`, `position`, `z-index`, `top`, `right`, `bottom`, `left`, `float`, `clear`, `box-sizing`, `overflow`, `visibility`, `vertical-align`.

这里记录下常用但不熟悉的两类：`display`中的`flex`和`table`。

#### flex布局

###### "flex-direction"属性的可选值及其含义

| 属性值 | 含义 |
| ----- | --- |
| row（默认值） | 主轴为水平方向。排列顺序与页面的文档顺序相同。如果文档顺序是 ltr，则排列顺序是从左到右；如果文档顺序是 rtl，则排列顺序是从右到左。 |
| row-reverse | 主轴为水平方向。排列顺序与页面的文档顺序相反。 |
| column | 主轴为垂直方向。排列顺序为从上到下。 |
| column-reverse | 主轴为垂直方向。排列顺序为从下到上。 |

###### "flex-wrap"属性的可选值及其含义

| 属性值 | 含义 |
| ----- | --- |
| nowrap（默认值） | 容器中的条目只占满容器在主轴方向上的一行，可能出现条目互相重叠或超出容器范围的现象。 |
| wrap | 当容器中的条目超出容器在主轴方向上的一行时，会把条目排列到下一行。下一行的位置与交叉轴的方向一致。 |
| wrap-reverse | 与 wrap 的含义类似，不同的是下一行的位置与交叉轴的方向相反。 |

###### order : 条目的顺序

###### flex, flex-grow, flex-shrink, flex-basis : 条目尺寸的弹性

###### "justify-content"属性的可选值和含义

| 属性值 | 含义 |
| ----- | --- |
| flex-start | 条目集中于该行的起始位置。第一个条目与其所在行在主轴起始方向上的边界保持对齐，其余的条目按照顺序依次排列。 |
| flex-end | 条目集中于该行的结束方向。最后一个条目与其所在行在主轴结束方向上的边界保持对齐，其余的条目按照顺序依次排列。 |
| center | 条目集中于该行的中央。条目都往该行的中央排列，在主轴起始方向和结束方向上留有同样大小的空白空间。如果空白空间不足，则条目会在两个方向上超出同样的空间。 |
| space-between | 第一个条目与其所在行在主轴起始方向上的边界保持对齐，最后一个条目与其所在行在主轴结束方向上的边界保持对齐。空白空间在条目之间平均分配，使得相邻条目之间的空白尺寸相同。 |
| space-around | 类似于 space-between，不同的是第一个条目和最后一个条目与该行的边界之间同样存在空白空间，该空白空间的尺寸是条目之间的空白空间的尺寸的一半。 |

###### "align-items"的可选值和含义

| 属性值 | 含义 |
| ----- | --- |
| flex-start | 条目与其所在行在交叉轴起始方向上的边界保持对齐。 |
| flex-end | 条目与其所在行在交叉轴结束方向上的边界保持对齐。 |
| center | 条目的空白边盒子（margin box）在交叉轴上居中。如果交叉轴尺寸小于条目的尺寸，则条目会在两个方向上超出相同大小的空间。 |
| baseline | 条目在基准线上保持对齐。在所有条目中，基准线与交叉轴起始方向上的边界距离最大的条目，它与所在行在交叉轴方向上的边界保持对齐。 |
| stretch | 如果条目的交叉轴尺寸的计算值是"auto"，则其实际使用的值会使得条目在交叉轴方向上尽可能地占满。 |

###### "align-content"的可选值和含义

| 属性值 | 含义 |
| ----- | --- |
| flex-start | 行集中于容器的交叉轴起始位置。第一行与容器在交叉轴起始方向上的边界保持对齐，其余行按照顺序依次排列。 |
| flex-end | 行集中于容器的交叉轴结束位置。第一行与容器在交叉轴结束方向上的边界保持对齐，其余行按照顺序依次排列。 |
| center | 行集中于容器的中央。行都往容器的中央排列，在交叉轴起始方向和结束方向上留有同样大小的空白空间。如果空白空间不足，则行会在两个方向上超出同样的空间。 |
| space-between | 行在容器中均匀分布。第一行与容器在交叉轴起始方向上的边界保持对齐，最后一行与容器在交叉轴结束方向上的边界保持对齐。空白空间在行之间平均分配，使得相邻行之间的空白尺寸相同。 |
| space-around | 类似于 space-between，不同的是第一行条目和最后一个行目与容器行的边界之间同样存在空白空间，而该空白空间的尺寸是行目之间的空白空间的尺寸的一半。 |
| stretch | 伸展行来占满剩余的空间。多余的空间在行之间平均分配，使得每一行的交叉轴尺寸变大。 |

#### table 布局

###### border-collapse

| value | meaning |
| --- | --- |
| separate | Adjacent cells have distinct borders (the separated-border table rendering model). |
| collapse | Adjacent cells have shared borders (the collapsed-border table rendering model). |

###### empty-cells

| value | meaning |
| --- | --- |
| show | Borders and backgrounds are drawn like in normal cells. |
| hide | No borders or backgrounds are drawn. |

### 边框

`border`, `border-image`, `border-radius`, `box-shadow`, `outline`.

#### border-color: transparent;

边框有四个方向，上下左右。当不需要某个方向的边框时，可以选择为none或者透明。透明可以保持该边框的宽度。

#### border-image: /* image-source | height | width | repeat */

`border-image-width`, `border-image-source`, `border-image-slice`, `border-image-repeat`, `border-image-outset`.

通过`border-image-slice`的`fill`值，可以实现`background-image`无法实现的效果。

### 文字

`text-align`, `text-decoration`, `text-indent`, `text-shadow`, `text-overflow`, `font-weight`, `font-family`, `font-size`, `font-style`, `color`, `white-space`, `letter-spacing`.

#### @font-face: 我一直记不住的

```
@font-face {
 font-family: "Open Sans";
 src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
        url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
}
```
### 背景

`background`, `filter`, `opacity`.

#### background

`-color`, `-image`, `-repeat`, `-position`, `-size`是我所熟悉的部分。

###### background-clip

| value | meaning |
| --- | --- |
| border-box | The background extends to the outside edge of the border (but underneath the border in z-ordering). |
| padding-box | The background extends to the outside edge of the padding. No background is drawn beneath the border. |
| content-box | The background is painted within (clipped to) the content box. |
| text | The background is painted within (clipped to) the foreground text. |

###### background-origin

| value | meaning |
| --- | --- |
| border-box | The background extends to the outside edge of the border (but underneath the border in z-ordering). |
| padding-box | No background is drawn below the border (background extends to the outside edge of the padding). |
| content-box | The background is painted within (clipped to) the content box. |

#### background-clip vs. background-origin

前者是剪裁，剪裁区域外的内容不现实。后者是定义绘制起点。两者有本质区别，虽然单一使用看起来相似，不如一起使用看一看区别。

```
#test {
  display: block;
  width: 500px;
  height: 500px;
  overflow: hidden;
  background-image: url("https://i.pinimg.com/originals/03/07/d3/0307d3a5dc50cef9516e9820caf6ccce.png");
  padding: 1em;
  margin: 2em;
  background-origin: border-box;
  background-clip: content-box;
}
```

使用的图片最好能看出位置，例如下面这张UV图。

![VU](https://i.pinimg.com/originals/03/07/d3/0307d3a5dc50cef9516e9820caf6ccce.png)

###### background-blend-mode

<blend-mode>#
where 
<blend-mode> = normal | multiply | screen | overlay | darken | lighten | color-dodge | color-burn | hard-light | soft-light | difference | exclusion | hue | saturation | color | luminosity

###### background-attachment

| value | meaning |
| --- | --- |
| fixed | This keyword means that the background is fixed with regard to the viewport. Even if an element has a scrolling mechanism, a ‘fixed’ background doesn't move with the element. |
| local | This keyword means that the background is fixed with regard to the element's contents: if the element has a scrolling mechanism, the background scrolls with the element's contents, and the background painting area and background positioning area are relative to the scrollable area of the element rather than to the border framing them. |
| scroll | This keyword means that the background is fixed with regard to the element itself and does not scroll with its contents. (It is effectively attached to the element's border.) |

#### fixed vs. scroll: 尚不明白

### 动画

`transform-origin`, `transform`, `transition`, `animation`, `@keyframes`, `perspective`, `backface-visibility`.

### 其它

`resize`, `cursor`, `point-events`, `user-select`.

总计
---

50+