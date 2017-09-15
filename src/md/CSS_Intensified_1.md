

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

#### grid 布局

这是2017年的全新布局，完美解决所有布局问题。嗯，话说Java Swing中也是这样，最常用布局就是grid布局。grid布局中的若干概念：

* Grid Container
* Grid Item
* Grid Track
* Grid Line
* Grid Cell
* Grid Area

##### Grid Container中的属性

`display`, `grid-template-columns`, `grid-template-rows`, `grid-template-areas`, `grid-template`, `grid-column-gap`, `grid-row-gap`, `grid-gap`, `justify-items`, `align-items`, `justify-content`, `align-content`, `grid-auto-columns`, `grid-auto-rows`, `grid-auto-flow`, `grid`.

###### Grid布局中的display

| value | meaning |
| ----- | ------- |
| grid | generates a block-level grid |
| inline-grid | generates an inline-level grid |
| subgrid | if your grid container is itself a grid item (i.e. nested grids), you can use this property to indicate that you want the sizes of its rows/columns to be taken from its parent rather than specifying its own. |

###### grid-template-columns, grid-template-rows

```
.container {
  grid-template-columns: <track-size> ... | <line-name> <track-size> ...;
  grid-template-rows: <track-size> ... | <line-name> <track-size> ...;
}
```

example 1:

```
.container{
  grid-template-columns: 40px 50px auto 50px 40px;
  grid-template-rows: 25% 100px auto;
}
```

example 2: 

```
.container {
  grid-template-columns: [first] 40px [line2] 50px [line3] auto [col4-start] 50px [five] 40px [end];
  grid-template-rows: [row1-start] 25% [row1-end] 100px [third-line] auto [last-line];
}
```

example 3: 

```
.container{
  grid-template-rows: [row1-start] 25% [row1-end row2-start] 25% [row2-end];
}
```

example 4: 

```
.container {
  grid-template-columns: repeat(3, 20px [col-start]) 5%;
}
```

example 5:

```
.container {
  grid-template-columns: 1fr 1fr 1fr;
}
```

example 6:

```
.container {
  grid-template-columns: 1fr 50px 1fr 1fr;
}
```

###### grid-template-areas

example : 

```
.item-a {
  grid-area: header;
}
.item-b {
  grid-area: main;
}
.item-c {
  grid-area: sidebar;
}
.item-d {
  grid-area: footer;
}

.container {
  grid-template-columns: 50px 50px 50px 50px;
  grid-template-rows: auto;
  grid-template-areas: 
    "header header header header"
    "main main . sidebar"
    "footer footer footer footer";
}
```

###### grid-template === grid-template-rows, grid-template-columns, and grid-template-areas

example :

```
.container {
  grid-template:
    [row1-start] "header header header" 25px [row1-end]
    [row2-start] "footer footer footer" 25px [row2-end]
    / auto 50px auto;
}
```

is equivalent to :

```
.container {
  grid-template-rows: [row1-start] 25px [row1-end row2-start] 25px [row2-end];
  grid-template-columns: auto 50px auto;
  grid-template-areas: 
    "header header header" 
    "footer footer footer";
}
```

###### grid-gap == grid-column-gap + grid-row-gap

###### justify-items == 全部的justify-self

| value | meaning |
| ----- | ------- |
| start | aligns the content to the left end of the grid area |
| end | aligns the content to the right end of the grid area |
| center | aligns the content in the center of the grid area |
| stretch | fills the whole width of the grid area (this is the default) |

###### align-items == 全部的align-self

| value | meaning |
| ----- | ------- |
| start | aligns the content to the top of the grid area |
| end | aligns the content to the bottom of the grid area |
| center | aligns the content in the center of the grid area |
| stretch | fills the whole height of the grid area (this is the default) |

###### justify-content 与container的父元素相关

| value | meaning |
| ----- | ------- |
| start | aligns the grid to the left end of the grid container |
| end | aligns the grid to the right end of the grid container |
| center | aligns the grid in the center of the grid container |
| stretch | resizes the grid items to allow the grid to fill the full width of the grid container |
| space-around | places an even amount of space between each grid item, with half-sized spaces on the far ends |
| space-between | places an even amount of space between each grid item, with no space at the far ends |
| space-evenly | places an even amount of space between each grid item, including the far ends |

###### align-content 与container的父元素相关

| value | meaning |
| ----- | ------- |
| start | aligns the grid to the top of the grid container |
| end | aligns the grid to the bottom of the grid container |
| center | aligns the grid in the center of the grid container |
| stretch | resizes the grid items to allow the grid to fill the full height of the grid container |
| space-around | places an even amount of space between each grid item, with half-sized spaces on the far ends |
| space-between | places an even amount of space between each grid item, with no space at the far ends |
| space-evenly | places an even amount of space between each grid item, including the far ends |

###### grid-auto-columns, grid-auto-rows

example :

```
.container {
  grid-auto-columns: 60px;
}
```

###### grid-auto-flow

| value | meaning |
| ----- | ------- |
| row | tells the auto-placement algorithm to fill in each row in turn, adding new rows as necessary |
| column | tells the auto-placement algorithm to fill in each column in turn, adding new columns as necessary |
| dense | tells the auto-placement algorithm to attempt to fill in holes earlier in the grid if smaller items come up later |

Note that dense might cause your items to appear out of order.

###### grid === grid-template-rows, grid-template-columns, grid-template-areas, grid-auto-rows, grid-auto-columns, and grid-auto-flow

##### Grid Item中的属性

`grid-column-start`, `grid-column-end`, `grid-row-start`, `grid-row-end`, `grid-column`, `grid-row`, `grid-area`, `justify-self`, `align-self`.

###### grid-column-start, grid-column-end, grid-row-start, grid-row-end

```
.item {
  grid-column-start: <number> | <name> | span <number> | span <name> | auto
  grid-column-end: <number> | <name> | span <number> | span <name> | auto
  grid-row-start: <number> | <name> | span <number> | span <name> | auto
  grid-row-end: <number> | <name> | span <number> | span <name> | auto
}
```

example 1: 

```
.item-a {
  grid-column-start: 2;
  grid-column-end: five;
  grid-row-start: row1-start
  grid-row-end: 3
}
```

example 2: 

```
.item-b {
  grid-column-start: 1;
  grid-column-end: span col4-start;
  grid-row-start: 2
  grid-row-end: span 2
}
```

###### grid-column == grid-column-start + grid-column-end
###### grid-row == grid-row-start + grid-row-end

```
.item {
  grid-column: <start-line> / <end-line> | <start-line> / span <value>;
  grid-row: <start-line> / <end-line> | <start-line> / span <value>;
}
```

example : 

```
.item-c {
  grid-column: 3 / span 2;
  grid-row: third-line / 4;
}
```

###### grid-area == grid-row-start + grid-column-start + grid-row-end + grid-column-end

```
.item {
  grid-area: <name> | <row-start> / <column-start> / <row-end> / <column-end>;
}
```

example 1:

```
.item-d {
  grid-area: header
}
```

example 2: 

```
.item-d {
  grid-area: 1 / col4-start / last-line / 6
}
```

###### justify-self

| value | meaning |
| ----- | ------- |
| start | aligns the content to the left end of the grid area |
| end | aligns the content to the right end of the grid area |
| center | aligns the content in the center of the grid area |
| stretch | fills the whole width of the grid area (this is the default) |

###### align-self

| value | meaning |
| ----- | ------- |
| start | aligns the content to the top of the grid area |
| end | aligns the content to the bottom of the grid area |
| center | aligns the content in the center of the grid area |
| stretch | fills the whole height of the grid area (this is the default) |

### 边框

`border`, `border-image`, `border-radius`, `box-shadow`, `outline`.

#### border-color: transparent;

边框有四个方向，上下左右。当不需要某个方向的边框时，可以选择为none或者透明。透明可以保持该边框的宽度。

#### border-image: /* image-source | height | width | repeat */

`border-image-width`, `border-image-source`, `border-image-slice`, `border-image-repeat`, `border-image-outset`.

通过`border-image-slice`的`fill`值，可以实现`background-image`无法实现的效果。

### 文字

`text-align`, `text-decoration`, `text-indent`, `text-shadow`, `text-overflow`, `font-weight`, `font-family`, `font-size`, `font-style`, `color`, `white-space`, `letter-spacing`, `word-spacing`.

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

`resize`, `cursor`, `point-events`, `user-select`, `list-style`.

#### list-style == list-style-type + list-style-image + list-style-position

注意：这个属性可以用于ul, ol，同样也可以用在li。

总计
---

50+