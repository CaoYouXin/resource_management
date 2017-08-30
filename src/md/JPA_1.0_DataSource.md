

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

这是一段典型的代码，获取`DataSource`对象。

```
MysqlDataSource mysqlDS = new MysqlDataSource();
mysqlDS.setURL("jdbc:mysql://localhost:3306/database_name");
mysqlDS.setUser("username");
mysqlDS.setPassword("password");
try {
  mysqlDS.setLoginTimeout(5);
  mysqlDS.setResultSetSizeThreshold(1000);
} catch (SQLException e) {
  logger.catching(e);
}
DATA_SOURCE = mysqlDS;
```

`myJPA 1.0`不支持事务，所以围绕`DataSource`以及`Connection`的功能有限。事务在`myJPA 2.0`中得到了支持。

结束语
---

内容虽然很简单，但是确实对myJPA 1.0的一个总结和记录。