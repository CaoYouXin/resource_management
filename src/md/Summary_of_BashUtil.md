

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

`Bash`是`Linux`系统上的强大工具，`Java`也可以调用`Bash`。

```
public static List<String> run(String cmd, boolean needOutput) throws IOException {
  logger.info(cmd);
!  Process process = Runtime.getRuntime().exec(new String[] { "bash", "-c", cmd });

  if (!needOutput) {
    return null;
  }
  List<String> ret = new ArrayList<>();

  InputStream stdin = process.getInputStream();
  InputStreamReader isr = new InputStreamReader(stdin);
  BufferedReader br = new BufferedReader(isr);

  String line = null;
  logger.info("<OUTPUT>");

  while ( (line = br.readLine()) != null) {
    logger.info(line);
    ret.add(line);
  }

  logger.info("</OUTPUT>");
  int exitVal = 0;
  try {
    exitVal = process.waitFor();
  } catch (InterruptedException e) {
    logger.catching(e);
  }
  logger.info("Process exitValue: " + exitVal);

  return ret;
}
```

以上代码同时考虑到两个方面的设计。首先，是它的第二个参数，可以选择是否需要输出。其次，是一项优化，在高亮的一行代码中可以看到，其逻辑似乎是`Java`调用`Bash`、而`Bash`进而调用`bash -c xxx`命令。正是这样！可以解决调用时传参的问题。

结束语
---

内容虽然很简单，但是确实对Serve 1.0的一个总结和记录，并且沿用到Serve 2.0。