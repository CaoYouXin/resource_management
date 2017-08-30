

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

上一篇文章中提到三个JPA方法`find`，`findAll`，`save`。这一篇中将说明最后一个，也是更通用一些的`query`。

```
public class CategoryRepository extends Repository<CategoryData, Long> {

    public CategoryRepository() {
        super(CategoryData.class);
    }

    public CategoryData findByName(String name) {
        List<CategoryData> categoryDataList = super.query("Select a From CategoryData a Where a.name = ? and a.disabled = 0",
                new String[]{"tech.caols.infinitely.datamodels."}, name);

        if (categoryDataList.size() > 0) {
            return categoryDataList.get(0);
        }
        return null;
    }
}
```

为了更好的封装，将`query`方法的调用放在`Repository`子类中，以实现其它拓展功能。

实现
---

```
public List<T> query(String s, String[] packageNames, Object... params) {
    SelectSQL selectSql = SqlFormat.getInstance().parseSelect(s, packageNames);

    if (selectSql == null) {
        throw new RuntimeException("impossible");
    }

    if (!this.clazz.equals(selectSql.getResultClass())) {
        throw new RuntimeException("this query should not be contained in this repository");
    }

    List<T> ret = new ArrayList<>();
    try (Connection conn = DatasourceFactory.getMySQLDataSource().getConnection()) {
        ResultSet resultSet;

        if (params.length == 0) {
            Statement statement = conn.createStatement();
            resultSet = statement.executeQuery(selectSql.getSql());
        } else {
            PreparedStatement preparedStatement = conn.prepareStatement(selectSql.getSql());
            int index = 0;
            for (Object param : params) {
                this.setPSbyFieldAtIndex(preparedStatement, ++index, param, param.getClass().getTypeName());
            }
            resultSet = preparedStatement.executeQuery();
        }
        logger.info(selectSql.getSql());

        while (resultSet.next()) {
            T one = this.buildOne();
            this.fill(one, resultSet, selectSql.resultColumns());
            ret.add(one);
        }
    } catch (SQLException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e) {
        logger.catching(e);
    }

    return ret;
}
```

### SqlFormat

解析`JPA-SQL`，主要用到的工具有`正则表达式`，`StringTokenizer`，`StringJoiner`。

```
private Pattern selectPattern = Pattern.compile("Select\\s+(?<select>.+?)\\s+From\\s+(?<from>.+?)(?:\\s+Where\\s+(?<where>.+?))*(?:\\s+Group By\\s+(?<groupBy>.+?)(?:\\s+Having\\s+(?<having>.+?))*)*(?:\\s+Order By\\s+(?<orderBy>.+?))*");

public SelectSQL parseSelect(String sql, String[] packageNames) {
    SelectSQL selectSqlObject = new SelectSQL(packageNames);

    Matcher m = selectPattern.matcher(sql);

    String select = this.matcherGroup(m, "select");
    String from = this.matcherGroup(m, "from");
    String where = this.matcherGroup(m, "where");
    String groupBy = this.matcherGroup(m, "groupBy");
    String having = this.matcherGroup(m, "having");
    String orderBy = this.matcherGroup(m, "orderBy");

    this.parseFrom(from, selectSqlObject);
    this.parseSelect(select, selectSqlObject);

    if (where != null) {
        this.parseWhere(where + " ", selectSqlObject);
    }

    if (groupBy != null) {
        this.parseGroupBy(groupBy + " ", selectSqlObject);
    }

    if (having != null) {
        this.parseHaving(having + " ", selectSqlObject);
    }

    if (orderBy != null) {
        this.parseOrderBy(orderBy + " ", selectSqlObject);
    }

    return selectSqlObject;
}
```

#### parseFrom

解析出表名，表别名，创建映射关系。

```
private void parseFrom(String from, SelectSQL selectSql) {
    StringJoiner stringJoiner = new StringJoiner(", ");
    for (String string : from.split(",")) {
        String[] split = string.trim().split("\\s+");
        String className = split[0];
        String alias = split[1];
        selectSql.addMapping(className);
        Class<?> clazz = selectSql.getMapping(className);
        selectSql.setAlias(alias, clazz);
        stringJoiner.add(String.format("`%s` %s", DBHelper.tableName(clazz), alias));
    }
    selectSql.setFrom(stringJoiner.toString());
}
```

#### parseSelect

利用别名映射，解析列名、列别名，为读取结果集做准备。

```
private void parseSelect(String select, SelectSQL selectSql) {
    StringJoiner stringJoiner = new StringJoiner(", ");
    for (String string : select.split(",")) {
        String trim = string.trim();
        if (trim.indexOf(' ') != -1) {
            Matcher matcher = asPattern.matcher(trim);
            if (matcher.find()) {
                String splitter = trim.substring(matcher.start(), matcher.end());
                System.out.println(splitter);
                stringJoiner.add(String.format("%s as `%s`",
                        this.parseSelectItemBeforeAs(trim.substring(0, matcher.start()), selectSql, false),
                        this.parseSelectItemAfterAs(trim.substring(matcher.end()), selectSql)));
            }
        } else {
            if (trim.indexOf('.') == -1) {
                stringJoiner.add(this.parseSelectItem(trim, selectSql));
            } else {
                stringJoiner.add(this.parseSelectItemBeforeAs(trim, selectSql, true));
            }
        }
    }
    selectSql.setSelect(stringJoiner.toString());
}
```

##### parseSelectItemBeforeAs

```
private String parseSelectItemBeforeAs(String item, SelectSQL selectSql, boolean isResult) {
    int indexOfBracket = item.indexOf('(');
    if (indexOfBracket != -1) {
        return this.parseAlias(item, selectSql, false);
    }

    int indexOfDot = item.indexOf('.');
    if (indexOfDot == -1) {
        throw new RuntimeException("jpql error (before as) : " + item);
    }

    String beforeDot = item.substring(0, indexOfDot);
    String afterDot = item.substring(indexOfDot + 1);
    Class<?> clazz = selectSql.getAlias(beforeDot);
    String name = selectSql.column(clazz, afterDot).getColumn().name();
    if (isResult) {
        selectSql.setResultClass(clazz);
        selectSql.addResult(name);
        return String.format("%s.`%s` as `%s`", beforeDot, name, name);
    }
    return String.format("%s.`%s`", beforeDot, name);
}
```

##### parseSelectItemAfterAs

```
private String parseSelectItemAfterAs(String item, SelectSQL selectSql) {
    int indexOfDot = item.indexOf('.');
    if (indexOfDot == -1) {
        throw new RuntimeException("jpql error (after as): " + item);
    }

    String beforeDot = item.substring(0, indexOfDot);
    String afterDot = item.substring(indexOfDot + 1);
    selectSql.addMapping(beforeDot);
    Class<?> clazz = selectSql.getMapping(beforeDot);
    String name = selectSql.column(clazz, afterDot).getColumn().name();
!    selectSql.setResultClass(clazz);
    selectSql.addResult(name);
    return name;
}
```

这个实现还是有很大局限性的，`ResultClass`每次都设置，看似是一种保护机制，实际上很不灵活。

```
public void setResultClass(Class<?> resultClass) {
    if (null != this.resultClass) {
        if (this.resultClass != resultClass) {
            throw new RuntimeException("jpql error, multi result class");
        }
    }
    this.resultClass = resultClass;
}
```

##### parseSelectItem

```
private String parseSelectItem(String item, SelectSQL selectSql) {
    Class<?> clazz = selectSql.getAlias(item);
    selectSql.setResultClass(clazz);
    StringJoiner sj = new StringJoiner(", ");
    for (ColumnMapping columnMapping : selectSql.columns(clazz)) {
        String name = columnMapping.getColumn().name();
        selectSql.addResult(name);
        sj.add(String.format("%s.`%s` as `%s`", item, name, name));
    }
    return sj.toString();
}
```

#### parse others

```
private void parseOrderBy(String orderBy, SelectSQL selectSql) {
    selectSql.setOrderBy(this.parseAlias(orderBy, selectSql, false));
}

private void parseHaving(String having, SelectSQL selectSql) {
    selectSql.setHaving(this.parseAlias(having, selectSql, false));
}

private void parseGroupBy(String groupBy, SelectSQL selectSql) {
    selectSql.setGroupBy(this.parseAlias(groupBy, selectSql, false));
}

private void parseWhere(String where, SelectSQL selectSql) {
    selectSql.setWhere(this.parseAlias(where, selectSql, false));
}
```

##### parseAlias

利用对象别名映射，替换出正确的`SQL`。

```
private String parseAlias(String clause, BaseSQL baseSQL, boolean isDelete) {
    String regex = String.format("(?<alias>%s)\\.(?<field>\\S+?)(?<after>>|<|\\s|\\)|=)", baseSQL.allAlias());
    Pattern p = Pattern.compile(regex);
    Matcher m = p.matcher(clause);
    StringBuffer sb = new StringBuffer();
    while (m.find()) {
        String alias = m.group("alias");
        String field = m.group("field");
        String after = m.group("after");

        Class<?> clazz = baseSQL.getAlias(alias);
        String name = baseSQL.column(clazz, field).getColumn().name();
        if (isDelete) {
            m.appendReplacement(sb, String.format("`%s`%s", name, after));
            continue;
        }

        m.appendReplacement(sb, String.format("%s.`%s`%s", alias, name, after));
    }
    m.appendTail(sb);
    return sb.toString();
}
```

结束语
---

实现myJPA 1.0的过程，是对`JPA`的`Client代码`进行逆推的过程。最初就是模仿，越是到后来实现复杂功能，越能感觉到自己的思想在涌现。