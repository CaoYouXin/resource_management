

卷首语
---

上一篇文章中对常用的熟悉的CSS属性做了分类总结。这篇文章将对不熟悉的属性依次列举。这篇文章中记录的每一个属性都值得花时间复习巩固。

正文
---

### all

| value | meaning |
| ----- | ------- |
| initial | This keyword specifies that all property values set on the element all is set on — or inherited from the element's parent — should be changed to their initial values. unicode-bidi and direction values are not affected. |
| inherit | This keyword specifies that all property values set on the element all is set on should be changed to their inherited values, i.e. the values set on the element's parent. unicode-bidi and direction values are not affected. |
| unset | This keyword indicates that all property values set on the element all is set on should be changed to their inherited value if they are inheritable, or their initial value if not. unicode-bidi and direction values are not affected. |
| revert | If the cascaded value of a property is the revert keyword, the behavior depends on the origin to which the declaration belongs |

| origin | effect |
| ------ | ------ |
| user-agent origin | Equivalent to unset. |
| user origin | Rolls back the cascade to the user-agent level, so that the specified value is calculated as if no author-level or user-level rules were specified for this property. |
| author origin | Rolls back the cascade to the user level, so that the specified value is calculated as if no author-level rules were specified for this property. For the purpose of revert, this origin includes the Override and Animation origins. |

### break-before, break-after, break-inside

1. If any of the three properties’ values is a forced break value, that is always, left, right, page, column or region, it has precedence and will be applied. If more than one of these values is a forced break, the break-before value has precedence over the break-after value, which in turn has precedence over the break-inside value.
2. If any of the three properties’ values is an avoid break value, that is avoid, avoid-page, avoid-region, avoid-column, no such break will be applied at that point.

### caption-side

Table标题位置。

```
/* Directional values */ 
caption-side: top; 
caption-side: bottom; 

/* Warning: non-standard values */ 
caption-side: left; 
caption-side: right; 
caption-side: top-outside; 
caption-side: bottom-outside; 

/* Global values */ 
caption-side: inherit; 
caption-side: initial; 
caption-side: unset;
```

### caret-color

可输入部分的光标颜色。在这个属性不存在的年代，聪明人竟然可以伪造这种效果。还真有过这种需求，呵呵。

### columns == column-width + column-count

### column-span = none | all

### column-fill = auto | balance

### column-gap = normal | <number>

### column-rule == column-rule-style + column-rule-width + column-rule-color

### counter-increament, counter-reset

example 1:
```
body {
  counter-reset: section;                     /* Set a counter named 'section', and it`s initial value is 0. */
}

h3::before {
  counter-increment: section;                 /* Increment the value of section counter by 1 */
  content: counter(section);                  /* Display the value of section counter */
}
```

example 2:
```
ol {
  counter-reset: section;                /* Creates a new instance of the
                                            section counter with each ol
                                            element */
  list-style-type: none;
}

li::before {
  counter-increment: section;            /* Increments only this instance
                                            of the section counter */
  content: counters(section, ".") " ";   /* Combines the values of all instances
                                            of the section counter, separated
                                            by a period */
}
```

### direction = ltr | rtl

### font-variant ==  font-variant-caps + font-variant-numeric + font-variant-alternates + font-variant-ligatures + font-variant-east-asian

话说这些属性都跟字体文件紧密相关，我是没用过太多汉字字体方面的显示优化。

### font-kerning = auto | normal | none

### font-stretch: 我们用方块字，哈哈哈哈

### font-synthesis = none | [ weight || style ]

### font-size-adjust = float number

最终字体大小，这里算小写字母大小，为font-size * font-size-adjust。

### font-feature-settings: 不明觉厉

### font-language-override = "ZHS"

### hyphens

有时单词太长，需要连字符连接上一行末尾与下一行起始。

| value | meaning |
| ----- | ------- |
| none | no hyphen; overflow if needed |
| manual | hyphen only at &hyphen; or &shy; (if needed) |
| auto | hyphen where the algorithm is deciding (if needed) |

### ime-mode

输入法相关设置

| value | meaning |
| ----- | ------- |
| auto | No change is made to the current input method editor state. This is the default. |
| normal | The IME state should be normal; this value can be used in a user style sheet to override the page's setting. This  |value is not supported by Internet Explorer.
| active | The input method editor is initially active; text entry is performed through it unless the user specifically  |dismisses it. Not supported on Linux.
| inactive | The input method editor is initially inactive, but the user may activate it if they wish. Not supported on Linux. |
| disabled | The input method editor is disabled and may not be activated by the user. |

### isolation

| value | meaning |
| ----- | ------- |
| auto | Is a keyword indicating that a new stacking context has to be created only if one properties applied to the element requires it. |
| isolate | Is a keyword indicating that a new stacking context must be created. |

### mix-blend-mode

元素内容与元素直接父元素以及元素背景之间的blend。

```
/* Keyword values */
mix-blend-mode: normal;
mix-blend-mode: multiply;
mix-blend-mode: screen;
mix-blend-mode: overlay;
mix-blend-mode: darken;
mix-blend-mode: lighten;
mix-blend-mode: color-dodge;
mix-blend-mode: color-burn;
mix-blend-mode: hard-light;
mix-blend-mode: soft-light;
mix-blend-mode: difference;
mix-blend-mode: exclusion;
mix-blend-mode: hue;
mix-blend-mode: saturation;
mix-blend-mode: color;
mix-blend-mode: luminosity;

/* Global values */
mix-blend-mode: initial;
mix-blend-mode: inherit;
mix-blend-mode: unset;
```

### mask

`mask-mode`, `mask-type`, `mask-composite`, `mask-image`, `mask-position`, `mask-repeat`, `mask-size`, `mask-origin`, `mask-clip`.

`mask`任未标准化，部分webkit浏览器需要`-webkit-`前缀。

###### mask-mode

| value | meaning |
| ----- | ------- |
| alpha | This keyword indicates that the transparency (alpha channel) values of the mask layer image should be used as the mask values. |
| luminance | This keyword indicates that the luminance values of the mask layer image should be used as the mask values. |
| match-source | If the mask-image property is of type <mask-source>, the luminance values of the mask layer image should be used as the mask values. |

If it is of type <image>, the alpha values of the mask layer image should be used as the mask values.

###### mask-type

| value | meaning |
| ----- | ------- |
| luminance | Is a keyword indicating that the associated mask image is a luminance mask, that is that its relative luminance values must be used when applying it. |
| alpha | Is a keyword indicating that the associated mask image is an alpha mask, that is that its alpha channel values must be used when applying it. |

###### mask-composite

| value | meaning |
| ----- | ------- |
| add | The source is placed over the destination. |
| subtract | The source is placed, where it falls outside of the destination. |
| intersect | The parts of source that overlap the destination, replace the destination. |
| exclude | The non-overlapping regions of source and destination are combined. |

###### mask-image

```
/* Keyword value */
mask-image: none;

/* <mask-source> value */
mask-image: url(masks.svg#mask1);

/* <image< values */
mask-image: linear-gradient(rgba(0, 0, 0, 1.0), transparent);
mask-image: image(url(mask.png), skyblue);

/* Multiple values */
mask-image: image(url(mask.png), skyblue), linear-gradient(rgba(0, 0, 0, 1.0), transparent);

/* Global values */
mask-image: inherit;
mask-image: initial;
mask-image: unset;
```

### orphans

控制一个块级元素的底端应该留有的最少行数。与排版有关。

### object-fit

当`replaced element`缩放时，内容的缩放方式。如`img`, `video`元素。

| value | meaning |
| ----- | ------- |
| fill | The replaced content is sized to fill the element’s content box. The entire object will completely fill the box. If the object's aspect ratio does not match the aspect ratio of its box, then the object will be stretched to fit. |
| contain | The replaced content is scaled to maintain its aspect ratio while fitting within the element’s content box. The entire object is made to fill the box, while preserving its aspect ratio, so the object will be "letterboxed" if its aspect ratio does not match the aspect ratio of the box. |
| cover | The replaced content is sized to maintain its aspect ratio while filling the element’s entire content box. If the object's aspect ratio does not match the aspect ratio of its box, then the object will be clipped to fit. |
| none | The replaced content is not resized. |
| scale-down | The content is sized as if none or contain were specified, whichever would result in a smaller concrete object size. |

### object-position

对`repleced element`有效。类似于`background-position`。

### overflow-wrap

| value | meaning |
| ----- | ------- |
| normal | Lines may only break at normal word break points (such as a space between two words). |
| break-word | To prevent overflow, normally unbreakable words may be broken at arbitrary points if there are no otherwise acceptable break points in the line. |

### overflow-clip-box NOT STANDARD

### quotes

```
/* Keyword value */
quotes: none;

/* <string> values */
quotes: "«" "»";           /* Set open-quote and close-quote to the French quotation marks */
quotes: "«" "»" "‹" "›";   /* Set two levels of quotation marks */

/* Global values */
quotes: inherit;
quotes: initial;
quotes: unset;
```

### shap-(outside, margin, image-threshold)

```
/* Keyword values */
shape-outside: none;
shape-outside: margin-box;
shape-outside: content-box;
shape-outside: border-box;
shape-outside: padding-box;

/* Function values */
shape-outside: circle();
shape-outside: ellipse();
shape-outside: inset(10px 10px 10px 10px);
shape-outside: polygon(10px 10px, 20px 20px, 30px 30px);

/* <url> value */
shape-outside: url(image.png);

/* Gradient value */
shape-outside: linear-gradient(45deg, rgba(255, 255, 255, 0) 150px, red 150px);

/* Global values */
shape-outside: initial;
shape-outside: inherit;
shape-outside: unset;
```

### scroll-behavior

| value | meaning |
| ----- | ------- |
| auto | The scrolling box scrolls instantly. |
| smooth | The scrolling box scrolls in a smooth fashion using a user-agent-defined timing function over a user-agent-defined period of time. User agents should follow platform conventions, if any. |

### scroll-snap-type（experimental）

| value | meaning |
| ----- | ------- |
| none | When the visual viewport of this scroll container is scrolled, it must ignore snap points. |
| mandatory | The visual viewport of this scroll container will rest on a snap point if it isn't currently scrolled. That means it snaps on that point when the scroll action finished, if possible. If content is added, moved, deleted or resized the scroll offset will be adjusted to maintain the resting on that snap point. |
| proximity | The visual viewport of this scroll container may come to rest on a snap point if it isn't currently scrolled considering the user agent's scroll parameters. If content is added, moved, deleted or resized the scroll offset may be adjusted to maintain the resting on that snap point. |

### tab-size vs. text-indent(I prefer.)

### table-layout

Under the "fixed" layout method, the entire table can be rendered once the first table row has been downloaded and analyzed. This can speed up rendering time over the "automatic" layout method, but subsequent cell content might not fit in the column widths provided. Cells use the overflow property to determine whether to clip any overflowing content, but only if the table has a known width; otherwise, they won't overflow the cells.

翻译：提高渲染速度，与overflow配合使用。

### text-justify

当`text-align`为`justify`时生效。可选值有`none`, `auto`, `inter-word`, `inter-character`。

### text-emphasis == text-emphasis-color, text-emphasis-style, text-emphasis-position

```
/* Initial value */
text-emphasis-color: currentColor;

/* <color> */
text-emphasis-color: #555;
text-emphasis-color: blue;
text-emphasis-color: rgba(90, 200, 160, 0.8);
text-emphasis-color: transparent;


/* Initial value */
text-emphasis-style: none; /* No emphasis marks */

/*  value */
text-emphasis-style: 'x';
text-emphasis-style: '点';
text-emphasis-style: '\25B2';
text-emphasis-style: '*';
text-emphasis-style: 'foo'; /* Should NOT use. It may be computed to or rendered as 'f' only */

/* Keywords value */
text-emphasis-style: filled;
text-emphasis-style: open;
text-emphasis-style: filled sesame;
text-emphasis-style: open sesame;


/* Initial value */
text-emphasis-position: over right;

/* Keywords value */
text-emphasis-position: over left;
text-emphasis-position: under right;
text-emphasis-position: under left;

text-emphasis-position: left over;
text-emphasis-position: right under;
text-emphasis-position: left under;


/* Global values */
text-emphasis-position: inherit;
text-emphasis-position: initial;
text-emphasis-position: unset;
```

### text-rendering

```
/* Keyword values */
text-rendering: auto;
text-rendering: optimizeSpeed;
text-rendering: optimizeLegibility;
text-rendering: geometricPrecision;

/* Global values */
text-rendering: inherit;
text-rendering: initial;
text-rendering: unset;
```

### text-transform

```
/* Keyword values */
text-transform: capitalize;
text-transform: uppercase;
text-transform: lowercase;
text-transform: none;
text-transform: full-width;

/* Global values */
text-transform: inherit;
text-transform: initial;
text-transform: unset;
```

### text-align-last

最后一行的对齐方式。

```
/* Keyword values */
text-align-last: auto;
text-align-last: start;
text-align-last: end;
text-align-last: left;
text-align-last: right;
text-align-last: center;
text-align-last: justify;

/* Global values */
text-align-last: inherit;
text-align-last: initial;
text-align-last: unset;
```

### text-orientation

只在`writing-mode`不为`horizontal-tb`时生效。

| value | meaning |
| ----- | ------- |
| mixed | Rotates the characters of horizontal scripts 90°. Lays out the characters of vertical scripts naturally. Default value. |
| upright | Lays out the characters of horizontal scripts naturally (upright), as well as the glyphs for vertical scripts. Note that this keyword causes all characters to be considered as left-to-right: the used value of direction is forced to be ltr. |
| sideways | Causes characters to be laid out as if they were laid out horizontally, but with the whole line rotated 90° to the right if writing-mode is vertical-rl, or to the left if it is vertical-lr. |
| sideways-right | An alias to sideways that is kept for compatibility purposes. |
| use-glyph-orientation | On SVG elements, this keyword leads to use the value of the deprecated SVG properties glyph-orientation-vertical and glyph-orientation-horizontal. |

### text-combine-upright

只在竖向排版中生效。

```
/* Keyword values */
text-combine-upright: none;
text-combine-upright: all;

/* Digits values */
text-combine-upright: digits;     /* fits 2 consecutive digits horizontally inside vertical text */
text-combine-upright: digits 4;   /* fits up to 4 consecutive digits horizontally inside vertical text */

/* Global values */
text-combine-upright: inherit;
text-combine-upright: initial;
text-combine-upright: unset;
```

### text-underline-position

只在`text-decoration`为`underline`时生效。

```
/* Keyword values */
text-underline-position: auto;
text-underline-position: under;
text-underline-position: left;
text-underline-position: right;
text-underline-position: under left;
text-underline-position: right under;

/* Global values */
text-underline-position: inherit;
text-underline-position: initial;
text-underline-position: unset;
```

### touch-action

```
/* Keyword values */
touch-action: auto;
touch-action: none;
touch-action: pan-x;
touch-action: pan-left;
touch-action: pan-right;
touch-action: pan-y;
touch-action: pan-up;
touch-action: pan-down;
touch-action: pinch-zoom;
touch-action: manipulation;

/* Global values */
touch-action: inherit;
touch-action: initial;
touch-action: unset;
```

### windows

与`orphans`遥相呼应。当`p`被拆分成两个部分时，第二部分必须在顶端留出的最少行数。

### word-break

| value | meaning |
| ----- | ------- |
| normal | Use the default line break rule. |
| break-all | To prevent overflow, word breaks should be inserted between any two characters (excluding Chinese/Japanese/Korean text). |
| keep-all | Word breaks should not be used for Chinese/Japanese/Korean (CJK) text. Non-CJK text behavior is the same as for normal. |

### will-change

```
/* Keyword values */
will-change: auto;
will-change: scroll-position;
will-change: contents;
will-change: transform;        /* Example of <custom-ident> */
will-change: opacity;          /* Example of <custom-ident> */
will-change: left, top;        /* Example of two <animateable-feature> */

/* Global values */
will-change: inherit;
will-change: initial;
will-change: unset;
```

### writing-mode

```
/* Keyword values */
writing-mode: horizontal-tb;
writing-mode: vertical-rl;
writing-mode: vertical-lr;

/* Global values */
writing-mode: inherit;
writing-mode: initial;
writing-mode: unset;
```

结束语
---

这篇文章一定要多读，争取形成第二篇分类总结。