# Hive分析窗口函数(二) NTILE,ROW_NUMBER,RANK,DENSE_RANK

作者：lxw的大数据田地

转载于博客lxw的大数据田地(http://lxw1234.com/archives/2015/04/181.htm)

本文中介绍前几个序列函数，NTILE,ROW_NUMBER,RANK,DENSE_RANK，下面会一一解释各自的用途。

**Hive版本为 apache-hive-0.13.1**

**注意： 序列函数不支持WINDOW子句。**

**数据准备：**

```sql
cookie1,2015-04-10,1
cookie1,2015-04-11,5
cookie1,2015-04-12,7
cookie1,2015-04-13,3
cookie1,2015-04-14,2
cookie1,2015-04-15,4
cookie1,2015-04-16,4
cookie2,2015-04-10,2
cookie2,2015-04-11,3
cookie2,2015-04-12,5
cookie2,2015-04-13,6
cookie2,2015-04-14,3
cookie2,2015-04-15,9
cookie2,2015-04-16,7
 
CREATE EXTERNAL TABLE lxw1234 (
  cookieid     string,
  createtime   string,  -- day 
  pv           int
) ROW FORMAT DELIMITED 
FIELDS TERMINATED BY ',' 
stored as textfile location '/tmp/lxw11/';
 
DESC lxw1234;
cookieid                STRING 
createtime              STRING 
pv                      INT 
 
hive> select * from lxw1234;
OK
cookie1 2015-04-10      1
cookie1 2015-04-11      5
cookie1 2015-04-12      7
cookie1 2015-04-13      3
cookie1 2015-04-14      2
cookie1 2015-04-15      4
cookie1 2015-04-16      4
cookie2 2015-04-10      2
cookie2 2015-04-11      3
cookie2 2015-04-12      5
cookie2 2015-04-13      6
cookie2 2015-04-14      3
cookie2 2015-04-15      9
cookie2 2015-04-16      7
```

### NTILE

NTILE(n)，用于将分组数据按照顺序切分成n片，返回当前切片值

NTILE不支持ROWS BETWEEN，比如 NTILE(2) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND CURRENT ROW)

如果切片不均匀，默认增加第一个切片的分布

```sql
SELECT 
  cookieid
  , createtime
  , pv
  , NTILE(2) OVER(PARTITION BY cookieid ORDER BY createtime) AS rn1	-- 分组内将数据分成2片
  , NTILE(3) OVER(PARTITION BY cookieid ORDER BY createtime) AS rn2  -- 分组内将数据分成3片
  , NTILE(4) OVER(ORDER BY createtime) AS rn3  -- 将所有数据分成4片
FROM lxw1234 
ORDER BY cookieid, createtime;
 
cookieid day           pv       rn1     rn2     rn3
-------------------------------------------------
cookie1 2015-04-10      1       1       1       1
cookie1 2015-04-11      5       1       1       1
cookie1 2015-04-12      7       1       1       2
cookie1 2015-04-13      3       1       2       2
cookie1 2015-04-14      2       2       2       3
cookie1 2015-04-15      4       2       3       3
cookie1 2015-04-16      4       2       3       4
cookie2 2015-04-10      2       1       1       1
cookie2 2015-04-11      3       1       1       1
cookie2 2015-04-12      5       1       1       2
cookie2 2015-04-13      6       1       2       2
cookie2 2015-04-14      3       2       2       3
cookie2 2015-04-15      9       2       3       4
cookie2 2015-04-16      7       2       3       4
```

> 比如，统计一个cookie，pv数最多的前1/3的天

```sql
SELECT 
  cookieid
  , createtime
  , pv
  , NTILE(3) OVER(PARTITION BY cookieid ORDER BY pv DESC) AS rn 
FROM lxw1234;
 
-- rn = 1 的记录，就是我们想要的结果
 
cookieid day           pv       rn
----------------------------------
cookie1 2015-04-12      7       1
cookie1 2015-04-11      5       1
cookie1 2015-04-15      4       1
cookie1 2015-04-16      4       2
cookie1 2015-04-13      3       2
cookie1 2015-04-14      2       3
cookie1 2015-04-10      1       3
cookie2 2015-04-15      9       1
cookie2 2015-04-16      7       1
cookie2 2015-04-13      6       1
cookie2 2015-04-12      5       2
cookie2 2015-04-14      3       2
cookie2 2015-04-11      3       3
cookie2 2015-04-10      2       3
```

### ROW_NUMBER

**ROW_NUMBER()** 从1开始，按照顺序，生成分组内记录的序列

ROW_NUMBER() 的应用场景非常多，再比如，获取分组内排序第一的记录;获取一个session中的第一条refer等。

> 比如，按照pv降序排列，生成分组内每天的pv名次

```sql
SELECT 
  cookieid
  , createtime
  , pv
  , ROW_NUMBER() OVER(PARTITION BY cookieid ORDER BY pv desc) AS rn 
FROM lxw1234;
 
cookieid day           pv       rn
------------------------------------------- 
cookie1 2015-04-12      7       1
cookie1 2015-04-11      5       2
cookie1 2015-04-15      4       3
cookie1 2015-04-16      4       4
cookie1 2015-04-13      3       5
cookie1 2015-04-14      2       6
cookie1 2015-04-10      1       7
cookie2 2015-04-15      9       1
cookie2 2015-04-16      7       2
cookie2 2015-04-13      6       3
cookie2 2015-04-12      5       4
cookie2 2015-04-14      3       5
cookie2 2015-04-11      3       6
cookie2 2015-04-10      2       7
```

### RANK 和 DENSE_RANK

**RANK()** 生成数据项在分组中的排名，排名相等会在名次中留下空位

**DENSE_RANK()** 生成数据项在分组中的排名，排名相等会在名次中不会留下空位

```sql
SELECT 
  cookieid
  , createtime
  , pv
  , RANK() OVER(PARTITION BY cookieid ORDER BY pv desc) AS rn1
  , DENSE_RANK() OVER(PARTITION BY cookieid ORDER BY pv desc) AS rn2
  , ROW_NUMBER() OVER(PARTITION BY cookieid ORDER BY pv DESC) AS rn3 
FROM lxw1234 
WHERE cookieid = 'cookie1';
 
cookieid day           pv       rn1     rn2     rn3 
-------------------------------------------------- 
cookie1 2015-04-12      7       1       1       1
cookie1 2015-04-11      5       2       2       2
cookie1 2015-04-15      4       3       3       3
cookie1 2015-04-16      4       3       3       4
cookie1 2015-04-13      3       5       4       5
cookie1 2015-04-14      2       6       5       6
cookie1 2015-04-10      1       7       6       7
 
rn1: 15号和16号并列第3, 13号排第5
rn2: 15号和16号并列第3, 13号排第4
rn3: 如果相等，则按记录值排序，生成唯一的次序，如果所有记录值都相等，或许会随机排吧。
```