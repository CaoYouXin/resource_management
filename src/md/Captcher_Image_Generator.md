

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

有一种防机器人使用网站服务的方法是使用验证码。验证码又分简单的图片验证码和手机发送验证码，以及另外很多与终端设备相关的手段和技术。

本来是打算直接上手机验证码的（虽然会花些钱），但是该服务的注册验证就需要图片验证码。无奈了...

图片验证码，实际上是在服务器上生成一张带有干扰信息和验证信息的图片。`Java`中有关于`Image`处理的包。

```
BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_BGR);
Graphics g = image.getGraphics();
```

接下来就可以绘制信息了。首先是验证信息。

```
private void drawChar(Graphics g, int x, int y, char code) {
  g.setFont(FONT);
  g.setColor(getRandColor(10, 200));
  g.translate(RANDOM.nextInt(3), RANDOM.nextInt(3));
  g.drawString(code + "", x, y);
}
```

接下来是干扰信息，这里使用了多条线段。

```
private void drawLine(Graphics g, int width, int height) {
  int x = RANDOM.nextInt(width);
  int y = RANDOM.nextInt(height);
  int xl = RANDOM.nextInt(width / 2);
  int yl = RANDOM.nextInt(height / 2);
  g.drawLine(x, y, x + xl, y + yl);
}
```

接着，将其转化成`byte[]`发送。

```
private byte[] convertImageToByteArray(BufferedImage image) {
  ByteArrayOutputStream bos = new ByteArrayOutputStream();
  try {
    ImageIO.write(image, "JPEG", bos);
    return bos.toByteArray();
  } catch (IOException e) {
    return new byte[0];
  }
}
```

发送时使用`ByteArrayEntity`。

```
public static void responseImage(HttpResponse response, byte[] bytes, String type) {
  response.setStatusCode(200);
  response.setEntity(new ByteArrayEntity(bytes, ContentType.create(type)));
  logger.info(String.format("generated a ", type));
}
```

结束语
---

内容虽然很简单，但是确实对Serve 1.0的一个总结和记录，并且沿用到Serve 2.0。