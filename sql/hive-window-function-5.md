# Hive分析窗口函数(五) GROUPING SETS,GROUPING__ID,CUBE,ROLLUP

作者：lxw的大数据田地

转载于博客lxw的大数据田地(http://lxw1234.com/archives/2015/04/193.htm)

**GROUPING SETS, GROUPING__ID, CUBE, ROLLUP**

这几个分析函数通常用于OLAP中，不能累加，而且需要根据不同维度上钻和下钻的指标统计，比如，分小时、天、月的UV数。

**Hive版本为 apache-hive-0.13.1**

**数据准备：**

```sql
2015-03,2015-03-10,cookie1
2015-03,2015-03-10,cookie5
2015-03,2015-03-12,cookie7
2015-04,2015-04-12,cookie3
2015-04,2015-04-13,cookie2
2015-04,2015-04-13,cookie4
2015-04,2015-04-16,cookie4
2015-03,2015-03-10,cookie2
2015-03,2015-03-10,cookie3
2015-04,2015-04-12,cookie5
2015-04,2015-04-13,cookie6
2015-04,2015-04-15,cookie3
2015-04,2015-04-15,cookie2
2015-04,2015-04-16,cookie1
 
CREATE EXTERNAL TABLE lxw1234 (
  month     STRING,
  day       STRING, 
  cookieid  STRING 
) ROW FORMAT DELIMITED 
FIELDS TERMINATED BY ',' 
stored as textfile location '/tmp/lxw11/';

hive> select * from lxw1234;
OK
2015-03 2015-03-10      cookie1
2015-03 2015-03-10      cookie5
2015-03 2015-03-12      cookie7
2015-04 2015-04-12      cookie3
2015-04 2015-04-13      cookie2
2015-04 2015-04-13      cookie4
2015-04 2015-04-16      cookie4
2015-03 2015-03-10      cookie2
2015-03 2015-03-10      cookie3
2015-04 2015-04-12      cookie5
2015-04 2015-04-13      cookie6
2015-04 2015-04-15      cookie3
2015-04 2015-04-15      cookie2
2015-04 2015-04-16      cookie1
```

### GROUPING SETS

在一个GROUP BY查询中，根据不同的维度组合进行聚合，等价于将不同维度的GROUP BY结果集进行UNION ALL

```sql
SELECT 
  month
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , GROUPING__ID 
FROM lxw1234 
GROUP BY month,day 
GROUPING SETS (month,day) 
ORDER BY GROUPING__ID;
 
month      day            uv      GROUPING__ID
------------------------------------------------
2015-03    NULL            5       1
2015-04    NULL            6       1
NULL       2015-03-10      4       2
NULL       2015-03-12      1       2
NULL       2015-04-12      2       2
NULL       2015-04-13      3       2
NULL       2015-04-15      2       2
NULL       2015-04-16      2       2
 
 
等价于 
SELECT 
  month
  , NULL
  , COUNT(DISTINCT cookieid) AS uv
  , 1 AS GROUPING__ID 
FROM lxw1234 
GROUP BY month 
UNION ALL 
SELECT 
  NULL
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , 2 AS GROUPING__ID 
FROM lxw1234 
GROUP BY day
```

再如：

```sql
SELECT 
  month
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , GROUPING__ID 
FROM lxw1234 
GROUP BY month,day 
GROUPING SETS (month,day,(month,day)) 
ORDER BY GROUPING__ID;
 
month         day             uv      GROUPING__ID
------------------------------------------------
2015-03       NULL            5       1
2015-04       NULL            6       1
NULL          2015-03-10      4       2
NULL          2015-03-12      1       2
NULL          2015-04-12      2       2
NULL          2015-04-13      3       2
NULL          2015-04-15      2       2
NULL          2015-04-16      2       2
2015-03       2015-03-10      4       3
2015-03       2015-03-12      1       3
2015-04       2015-04-12      2       3
2015-04       2015-04-13      3       3
2015-04       2015-04-15      2       3
2015-04       2015-04-16      2       3
 
 
等价于
SELECT 
  month
  , NULL
  , COUNT(DISTINCT cookieid) AS uv
  , 1 AS GROUPING__ID 
FROM lxw1234 
GROUP BY month 
UNION ALL 
SELECT 
  NULL
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , 2 AS GROUPING__ID 
FROM lxw1234 
GROUP BY day
UNION ALL 
SELECT 
  month
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , 3 AS GROUPING__ID 
FROM lxw1234 
GROUP BY month,day
```

其中的 **GROUPING__ID**，表示结果属于哪一个分组集合。

### CUBE

根据GROUP BY的维度的所有组合进行聚合。

```sql
SELECT 
  month
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , GROUPING__ID 
FROM lxw1234 
GROUP BY month,day 
WITH CUBE 
ORDER BY GROUPING__ID;

month  		   day             uv     GROUPING__ID
---------------------------------------------------
NULL           NULL            7            0
2015-03        NULL            5            1
2015-04        NULL            6            1
NULL           2015-04-12      2            2
NULL           2015-04-13      3            2
NULL           2015-04-15      2            2
NULL           2015-04-16      2            2
NULL           2015-03-10      4            2
NULL           2015-03-12      1            2
2015-03        2015-03-10      4            3
2015-03        2015-03-12      1            3
2015-04        2015-04-16      2            3
2015-04        2015-04-12      2            3
2015-04        2015-04-13      3            3
2015-04        2015-04-15      2            3

等价于
SELECT 
  NULL
  , NULL
  , COUNT(DISTINCT cookieid) AS uv
  , 0 AS GROUPING__ID 
FROM lxw1234
UNION ALL 
SELECT 
  month
  , NULL
  , COUNT(DISTINCT cookieid) AS uv
  , 1 AS GROUPING__ID 
FROM lxw1234 
GROUP BY month 
UNION ALL 
SELECT 
  NULL
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , 2 AS GROUPING__ID 
FROM lxw1234 
GROUP BY day
UNION ALL 
SELECT 
  month
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , 3 AS GROUPING__ID 
FROM lxw1234 
GROUP BY month,day
```

### ROLLUP

是CUBE的子集，以最左侧的维度为主，从该维度进行层级聚合。

```sql
-- 比如，以month维度进行层级聚合：
SELECT 
  month
  , day
  , COUNT(DISTINCT cookieid) AS uv
  , GROUPING__ID  
FROM lxw1234 
GROUP BY month,day
WITH ROLLUP 
ORDER BY GROUPING__ID;
 
month  			    day             uv     GROUPING__ID
---------------------------------------------------
NULL             NULL            7       0
2015-03          NULL            5       1
2015-04          NULL            6       1
2015-03          2015-03-10      4       3
2015-03          2015-03-12      1       3
2015-04          2015-04-12      2       3
2015-04          2015-04-13      3       3
2015-04          2015-04-15      2       3
2015-04          2015-04-16      2       3
 
-- 可以实现这样的上钻过程：
-- 月天的UV->月的UV->总UV
```

```sql
-- 把month和day调换顺序，则以day维度进行层级聚合：
 
SELECT 
  day
  , month
  , COUNT(DISTINCT cookieid) AS uv
  , GROUPING__ID  
FROM lxw1234 
GROUP BY day,month 
WITH ROLLUP 
ORDER BY GROUPING__ID;

day  			      month              uv     GROUPING__ID
-------------------------------------------------------
NULL            NULL               7       0
2015-04-13      NULL               3       1
2015-03-12      NULL               1       1
2015-04-15      NULL               2       1
2015-03-10      NULL               4       1
2015-04-16      NULL               2       1
2015-04-12      NULL               2       1
2015-04-12      2015-04            2       3
2015-03-10      2015-03            4       3
2015-03-12      2015-03            1       3
2015-04-13      2015-04            3       3
2015-04-15      2015-04            2       3
2015-04-16      2015-04            2       3
 
-- 可以实现这样的上钻过程：
-- 天月的UV->天的UV->总UV
-- （这里，根据天和月进行聚合，和根据天聚合结果一样，因为有父子关系，如果是其他维度组合的话，就会不一样）
```

这种函数，需要结合实际场景和数据去使用和研究，只看说明的话，很难理解。

官网的介绍： https://cwiki.apache.org/confluence/display/Hive/Enhanced+Aggregation%2C+Cube%2C+Grouping+and+Rollup