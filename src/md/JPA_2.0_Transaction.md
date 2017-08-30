

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

`myJPA 2.0`支持事务，并采用`ThreadLocal`技术保证操作的`Connection`的正确性。

```
private static ThreadLocal<Connection> CONNECTION_THREAD_LOCAL = new ThreadLocal<>();

public static Connection getConnection() {
    Connection connection = CONNECTION_THREAD_LOCAL.get();
    try {
        if (null == connection || connection.isClosed()) {
            connection = getMySQLDataSource().getConnection();
            connection.setAutoCommit(true);
        }
    } catch (SQLException e) {
        logger.catching(e);
    }

    CONNECTION_THREAD_LOCAL.set(connection);
    return connection;
}
```

通过`Connection.getAutoCommit`判断是否为事务中。

```
public static void closeConnection(Connection conn) {
    if (null == conn) {
        return;
    }

    try {
        if (!conn.getAutoCommit()) {
            return;
        }

        conn.close();
    } catch (SQLException e) {
        logger.catching(e);
    }
}
```

接下来就是熟悉的`begin`，`commit`，`rollback`。

```
public static void begin(int level) {
    Connection connection = getConnection();
    try {
        connection.setAutoCommit(false);
        connection.setTransactionIsolation(level);
    } catch (SQLException e) {
        logger.catching(e);
    }
}

public static void commit() {
    Connection connection = getConnection();

    try {
        connection.commit();
    } catch (SQLException e1) {
        logger.catching(e1);
        try {
            connection.rollback();
        } catch (SQLException e2) {
            logger.catching(e2);
        }
    } finally {
        try {
            connection.close();
        } catch (SQLException e3) {
            logger.catching(e3);
        }
    }
}

public static void rollback() {
    Connection connection = getConnection();

    try {
        connection.rollback();
    } catch (SQLException e) {
        logger.catching(e);
    } finally {
        try {
            connection.close();
        } catch (SQLException e) {
            logger.catching(e);
        }
    }
}
```

结束语
---

内容虽然很简单，但确实是对myJPA 2.0的记录和总结。