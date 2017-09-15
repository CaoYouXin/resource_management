

卷首语
---

上一篇文章中对不熟悉的CSS属性做了列举。这篇文章将CSS中的单位作出列举。这篇文章中记录的每一个属性都值得花时间复习巩固。

正文
---

### 长度单位

#### 字体相关

| name | meaning |
| ---- | ------- |
| em | Represents the calculated font-size of the element. If used on the font-size property itself, it represents the inherited font-size of the element. |
| ex | Represents the x-height of the element's font. On fonts with the 'x' letter, this is generally the height of lowercase letters in the font; 1ex ≈ 0.5em in many fonts. |
| cap | Represents the "cap height" (nominal height of capital letters) of the element’s font. |
| ch | Represents the width, or more precisely the advance measure, of the glyph '0' (zero, the Unicode character U+0030) in the element's font. |
| ic | Equal to the used advance measure of the “水” (CJK water ideograph, U+6C34) glyph found in the font used to render it. |
| rem | Represents the font-size of the root element (e.g., the font-size of the <html> element). When used within the root elements font-size, it represents its initial value (common browser default is 16px, but changes based upon users preferences). |
| lh | Equal to the computed value of the line-height property of the element on which it is used, converted to an absolute length. |
| rlh | Equal to the computed value of the line-height property on the root element, converted to an absolute length. When specified on the font-size or line-height properties of the root element, the rlh unit refers to the properties' initial value. |

#### 视口百分比相关

| name | meaning |
| ---- | ------- |
| vh | Equal to 1% of the height of the viewport's initial containing block. |
| vw | Equal to 1% of the width of the viewport's initial containing block. |
| vi | Equal to 1% of the size of the initial containing block, in the direction of the root element’s inline axis. |
| vb | Equal to 1% of the size of the initial containing block, in the direction of the root element’s block axis. |
| vmin | Equal to the smaller of vw or vh. |
| vmax | Equal to the larger of vw or vh. |

#### 绝对量

| name | meaning |
| ---- | ------- |
| px | Relative to the viewing device. |
| mm | One millimeter. |
| q | A quarter of a millimeter (1/40th of a centimeter). |
| cm | One centimeter (10 millimeters). |
| in | One inch (2.54 centimeters). |
| pt | One point (1/72nd of an inch). |
| pc | One pica (12 points). |

For screen display, typically one device pixel (dot) of the display.
For printers and very high resolution screens one CSS pixel implies multiple device pixels, so that the number of pixel per inch stays around 96.

##### 1px问题，通过meta viewport width=device-width解决

### 角度单位

| name | meaning |
| ---- | ------- |
| deg | Represents an angle in degrees. One full circle is 360deg. Examples: 0deg, 90deg, 14.23deg. |
| grad | Represents an angle in gradians. One full circle is 400grad. Examples: 0grad, 100grad, 38.8grad. |
| rad | Represents an angle in radians. One full circle is 2π radians which approximates to 6.2832rad. 1rad is 180/π degrees. Examples: 0rad, 1.0708rad, 6.2832rad. |
| turn | Represents an angle in a number of turns. One full circle is 1turn. Examples: 0turn, 0.25turn, 1.2turn. |

### 分辨率单位

| name | meaning |
| ---- | ------- |
| dpi | Represents the number of dots per inch. A screen typically contains 72 or 96 dpi, but a printed document usually has much greater dpi. As 1 inch is 2.54 cm, 1dpi ≈ 0.39dpcm. |
| dpcm | Represents the number of dots per centimeter. As 1 inch is 2.54 cm, 1dpcm ≈ 2.54dpi. |
| dppx | Represents the number of dots per px unit. Due to the 1:96 fixed ratio of CSS in to CSS px, 1dppx is equivalent to 96dpi, which corresponds to the default resolution of images displayed in CSS as defined by image-resolution. |

### 时间单位

`s`, `ms`.

### 频率单位

`Hz`, `kHz`.

结束语
---

果然有很多单位不熟悉，甚至见都没见过。
