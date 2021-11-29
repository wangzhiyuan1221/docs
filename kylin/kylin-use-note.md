# Kylin 使用笔记

### Query引擎

Kylin 的 query 引擎依赖的是 Calcite框架，Calcite 中的元数据类似于 Oracle，所有的表和字段名都会在解析的时候转换成大写，但是在 Calcite 中由是 大小写敏感的，因此除非你将所有的表名和字段名都定义成大写，获取在查询的时候对于字段和表都加上双引号（这样在解析的时候就不会被转换成大写了），否则很可能出现字段或者表找不到的错误。

同时在查询的时候，Query Sql 中的字段名或者别名会转成大写，如

```sql
select group_name groupName, count(distinct num1) uv 
from DM_KYLIN_AB_FLOW_BEHAVIOR_DTL_FULL_1D 
where test_id = 10256 and ab_index = 'enter_page' group by group_name;

result:
GROUPNAME  UV
A          147743
C          37158
```

想要按照自己取的别名返回，可以查询的时候对于别名加上双引号，就不会被转换成大写了

```sql
select group_name "groupName", count(distinct num1) "uv" 
from DM_KYLIN_AB_FLOW_BEHAVIOR_DTL_FULL_1D 
where test_id = 10256 and ab_index = 'enter_page' group by group_name;

result:
groupName  uv
A          147743
C          37158
```
