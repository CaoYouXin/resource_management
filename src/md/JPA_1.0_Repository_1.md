

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

`Java Persistence API`使程序员更多关注业务代码，而非数据库操作代码。是对日常应用场景及数据库操作的一层抽象。

* 对象保存
* 对象(列表)读取
* 对象条件查询
* 对象删除

这种抽象方式，与数据库操作`增删改查`相比，更靠近业务一些。这篇文章将记录除条件查询之外的各项实现。

对象定义
---

目前，主流的定义数据库操作对象的方式是采用注解，定义表名、列名。`myJPA 1.0`中还不支持自动建表，所以注解的功能就这么多。

`Client`代码
---

假设现在有一个`Class`定义了一个`Table Entity`。`myJPA 1.0`实现的调用方式是这样的。首先，创建`Repository`的子类。

```
public class CategoryRepository extends Repository<CategoryData, Long> {
  public CategoryRepository() {
    super(CategoryData.class);
  }
}
```

然后，就可以方便的实现单表操作了。

```
CategoryRepository categoryRepository = new CategoryRepository();
CategoryData find = categoryRepository.find(1L);
List<CategoryData> findAll = categoryRepository.findAll();

CategoryData category = new CategoryData();
categoryRepository.save(category);
```

实现
---

实现起来的思路基本上是相同的，必要的一些步骤有：

* 拼接`SQL`字符串
* 获取`Connection`，并且要记住释放资源
* 获取`Statement`，或者`PreparedStatement`并且设置正确的参数
* 对结果集`ResultSet`进行操作

### find

```
public T find(ID id) {
    String sql = String.format("Select %s From `%s` Where `%s`=?",
            this.columnsString(false), this.tableName(),
            this.keyColumn().getColumn().name());

    try (Connection conn = DatasourceFactory.getMySQLDataSource().getConnection()) {
        PreparedStatement preparedStatement = conn.prepareStatement(sql);
        logger.info(sql);

        this.setPSbyFieldAtIndex(preparedStatement, 1, id, id.getClass().getTypeName());

        ResultSet resultSet = preparedStatement.executeQuery();
        if (!resultSet.next()) {
            return null;
        }

        T one = this.buildOne();
        this.fill(one, resultSet);
        return one;
    } catch (SQLException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e) {
        logger.catching(e);
        return null;
    }
}
```

这里使用到若干工具方法，接下来紧接着逐一介绍。

#### 获取列名列表字符串，逗号分隔

```
private String columnsString(final boolean excludeIDKey) {
    final StringJoiner sj = new StringJoiner("`, `", "`", "`");
    List<ColumnMapping> columns = this.columns();
    columns.forEach(col -> {
        if (col.isKey() && excludeIDKey) {
            return;
        }
        sj.add(col.getColumn().name());
    });
    return sj.toString();
}
```

##### 获取列映射列表

```
public static List<ColumnMapping> columns(Class<?> clazz) {
    Entity entity = clazz.getDeclaredAnnotation(Entity.class);
    if (null == entity) {
        throw new RuntimeException("not a entity");
    }

    List<ColumnMapping> ret = new ArrayList<>();
    for (Field field : clazz.getDeclaredFields()) {
        Column column = field.getDeclaredAnnotation(Column.class);
        ColumnMapping columnMapping = new ColumnMapping(column, field);

        Id id = field.getDeclaredAnnotation(Id.class);
        if (null != id) {
            columnMapping.setKey(true);
        }

        ret.add(columnMapping);
    }

    return ret;
}
```

#### 获取表名

```
public static String tableName(Class<?> clazz) {
    Entity entity = clazz.getDeclaredAnnotation(Entity.class);
    if (null == entity) {
        throw new RuntimeException("not a entity");
    }

    Table table = clazz.getDeclaredAnnotation(Table.class);
    if (null == table) {
        throw new RuntimeException("not a table");
    }

    return table.name();
}
```

#### 获取主键定义

这里不支持联合主键。当然，未来支持联合主键的时候，这部分代码也不会有改动，因为联合主键的定义应该同样是一个类。

```
private ColumnMapping keyColumn() {
    for (ColumnMapping columnMapping : this.columns()) {
        if (columnMapping.isKey()) {
            return columnMapping;
        }
    }
    return null;
}
```

#### 为`PreparedStatement`设置参数

通过判断列类型，调用不同的方法。

```
private void setPSbyFieldAtIndex(PreparedStatement preparedStatement, int index, Object param, String typeName) throws SQLException {
    switch (typeName) {
        case "byte":
        case "java.lang.Byte":
            preparedStatement.setByte(index, (Byte) param);
            break;
        case "short":
        case "java.lang.Short":
            preparedStatement.setShort(index, (Short) param);
            break;
        case "int":
        case "java.lang.Integer":
            preparedStatement.setInt(index, (Integer) param);
            break;
        case "long":
        case "java.lang.Long":
            preparedStatement.setLong(index, (Long) param);
            break;
        case "float":
        case "java.lang.Float":
            preparedStatement.setFloat(index, (Float) param);
            break;
        case "double":
        case "java.lang.Double":
            preparedStatement.setDouble(index, (Double) param);
            break;
        case "java.math.BigDecimal":
            preparedStatement.setBigDecimal(index, (BigDecimal) param);
            break;
        case "java.util.Date":
!            preparedStatement.setTimestamp(index, new Timestamp(((Date) param).getTime()), calendar);
            break;
        case "java.lang.String":
            preparedStatement.setString(index, (String) param);
            break;
        case "java.io.Reader":
            preparedStatement.setCharacterStream(index, (Reader) param);
            break;
        case "java.io.InputStream":
            preparedStatement.setBinaryStream(index, (InputStream) param);
            break;
        default:
            System.out.println(typeName);
            break;
    }
}
```

需要注意的是对`Date`类的处理，传入的`canlender`需要设置正确的时区。

```
private static final Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Shanghai"));
```

#### 创建一个对象

```
public static <K> K buildOne(Class<K> clazz) {
    try {
        return clazz.newInstance();
    } catch (InstantiationException | IllegalAccessException e) {
        logger.catching(e);
        return null;
    }
}
```

#### 为创建的对象填充返回结果

```
private void fill(T one, ResultSet resultSet) throws IllegalAccessException, SQLException, NoSuchMethodException, InvocationTargetException {
    List<ColumnMapping> columns = this.columns();
    for (ColumnMapping column : columns) {
        this.fill(one, resultSet, column);
    }
}
```

由于`find`方法返回整个对象，所以该对象的所有列都需要填充。

```
private void fill(T one, ResultSet resultSet, ColumnMapping column) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, SQLException {
    String name = column.getField().getName();
    String setterName = getDateManipulationMethodName(name, "set");
    Method setterMethod = this.clazz.getDeclaredMethod(setterName, column.getField().getType());

    String columnName = column.getColumn().name();
    String typeName = column.getField().getGenericType().getTypeName();

    this.fill(typeName, one, setterMethod, resultSet, false, null, columnName);
}
```

##### 填充对象值通用方法

判断列类型，以及对返回集的索引方式，通过setter方法的反射调用进行填值。

```
private void fill(String typeName, T one, Method setterMethod, ResultSet resultSet, boolean isIntParam, Integer index, String columnName) throws SQLException, InvocationTargetException, IllegalAccessException {
    switch (typeName) {
        case "byte":
        case "java.lang.Byte":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getByte(index));
            } else {
                setterMethod.invoke(one, resultSet.getByte(columnName));
            }
            break;
        case "short":
        case "java.lang.Short":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getShort(index));
            } else {
                setterMethod.invoke(one, resultSet.getShort(columnName));
            }
            break;
        case "int":
        case "java.lang.Integer":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getInt(index));
            } else {
                setterMethod.invoke(one, resultSet.getInt(columnName));
            }
            break;
        case "long":
        case "java.lang.Long":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getLong(index));
            } else {
                setterMethod.invoke(one, resultSet.getLong(columnName));
            }
            break;
        case "float":
        case "java.lang.Float":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getFloat(index));
            } else {
                setterMethod.invoke(one, resultSet.getFloat(columnName));
            }
            break;
        case "double":
        case "java.lang.Double":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getDouble(index));
            } else {
                setterMethod.invoke(one, resultSet.getDouble(columnName));
            }
            break;
        case "java.math.BigDecimal":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getBigDecimal(index));
            } else {
                setterMethod.invoke(one, resultSet.getBigDecimal(columnName));
            }
            break;
        case "java.util.Date":
            if (isIntParam) {
!                setterMethod.invoke(one, resultSet.getTimestamp(index, calendar));
            } else {
!                setterMethod.invoke(one, resultSet.getTimestamp(columnName, calendar));
            }
            break;
        case "java.lang.String":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getString(index));
            } else {
                setterMethod.invoke(one, resultSet.getString(columnName));
            }
            break;
        case "java.io.Reader":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getCharacterStream(index));
            } else {
                setterMethod.invoke(one, resultSet.getCharacterStream(columnName));
            }
            break;
        case "java.io.InputStream":
            if (isIntParam) {
                setterMethod.invoke(one, resultSet.getBinaryStream(index));
            } else {
                setterMethod.invoke(one, resultSet.getBinaryStream(columnName));
            }
            break;
        default:
            System.out.println(typeName);
            break;
    }
}
```

同样需要注意的是对`Date`类的处理。

### findAll

```
public List<T> findAll() {
    String sql = String.format("Select %s From `%s`", this.columnsString(false), this.tableName());

    List<T> ret = new ArrayList<>();
    try (Connection conn = DatasourceFactory.getMySQLDataSource().getConnection()) {
        Statement statement = conn.createStatement();
        ResultSet resultSet = statement.executeQuery(sql);
        logger.info(sql);

        while (resultSet.next()) {
            T one = this.buildOne();
            this.fill(one, resultSet);
            ret.add(one);
        }
    } catch (SQLException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e) {
        logger.catching(e);
    }

    return ret;
}
```

### save

```
public boolean save(T one) {
    Field keyField = this.keyColumn().getField();
    boolean accessible = keyField.isAccessible();
    keyField.setAccessible(true);
    Object key = null;
    try {
        key = keyField.get(one);
    } catch (IllegalAccessException e) {
        logger.catching(e);
    }
    keyField.setAccessible(accessible);

    if (null == key) {
        return this.insert(one);
    } else {
        T existOne = this.find((ID) key);
        if (null == existOne) {
            return this.insert(one);
        } else {
            return this.update(one);
        }
    }
}
```

#### insert

```
private boolean insert(T one) {
    List<ColumnMapping> columns = this.columns().stream().filter(columnMapping -> {
        String name = columnMapping.getField().getName();
        String getterName = getDateManipulationMethodName(name, "get");
        try {
            Method getterMethod = this.clazz.getDeclaredMethod(getterName);
            return getterMethod.invoke(one) != null;
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            logger.catching(e);
            return false;
        }
    }).collect(Collectors.toList());

    final StringJoiner columnsSj = new StringJoiner("`, `", "`", "`");
    final StringJoiner sj = new StringJoiner(", ", "", "");
    columns.forEach(col -> {
        if (col.isKey()) {
            return;
        }
        columnsSj.add(col.getColumn().name());
        sj.add("?");
    });
    String sql = String.format("Insert into `%s`(%s) Values (%s)", this.tableName(),
            columnsSj.toString(), sj.toString());

    try (Connection conn = DatasourceFactory.getMySQLDataSource().getConnection()) {
!        PreparedStatement preparedStatement = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        logger.info(sql);

        int index = 0;
        for (ColumnMapping column : columns) {
            if (column.isKey()) {
                continue;
            }

            this.setPSbyFieldAtIndex(one, preparedStatement, ++index, column);
        }

        int affectedRows = preparedStatement.executeUpdate();
        if (affectedRows == 0) {
            return false;
        }

!        try (ResultSet generatedKeys = preparedStatement.getGeneratedKeys()) {
!            if (generatedKeys.next()) {
!                this.fill(one, generatedKeys, this.keyColumn(), 1);
!                return true;
!            } else {
!                return false;
!            }
!        }
    } catch (Exception e) {
        logger.catching(e);
    }

    return false;
}
```

注意，填充主键的功能需要在获取`Statement`的时候开启`RETURN_GENERATED_KEYS`。

#### update

```
private boolean update(T one) {
    final StringJoiner sj = new StringJoiner(", ", "", "");
    List<ColumnMapping> columns = this.columns();
    columns.forEach(col -> {
        if (col.isKey()) {
            return;
        }
        sj.add('`' + col.getColumn().name() + "`=?");
    });
    String sql = String.format("Update `%s` Set %s Where `%s`=?", this.tableName(),
            sj.toString(), this.keyColumn().getColumn().name());

    try (Connection conn = DatasourceFactory.getMySQLDataSource().getConnection()) {
        PreparedStatement preparedStatement = conn.prepareStatement(sql);
        logger.info(sql);

        int index = 0;
        for (ColumnMapping column : columns) {
            if (column.isKey()) {
                continue;
            }

            this.setPSbyFieldAtIndex(one, preparedStatement, ++index, column);
        }

        this.setPSbyFieldAtIndex(one, preparedStatement, ++index, this.keyColumn());

        return preparedStatement.executeUpdate() > 0;
    } catch (Exception e) {
        logger.catching(e);
    }

    return false;
}
```

结束语
---

实现myJPA 1.0的过程，是对`JPA`的`Client代码`进行逆推的过程。最初就是模仿，越是到后来实现复杂功能，越能感觉到自己的思想在涌现。