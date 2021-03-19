# Hive分析窗口函数(一) SUM,AVG,MIN,MAX

作者：lxw的大数据田地

转载于博客lxw的大数据田地(http://lxw1234.com/archives/2015/04/176.htm)

Hive中提供了越来越多的分析函数，用于完成负责的统计分析。抽时间将所有的分析窗口函数理一遍，将陆续发布。

今天先看几个基础的，SUM、AVG、MIN、MAX。

用于实现分组内所有和连续累积的统计。

**Hive版本为 apache-hive-0.13.1**

**数据准备**

```sql
CREATE EXTERNAL TABLE lxw1234 (
  cookieid     string,
  createtime   string,   --day 
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
```

### SUM

**注意：结果和ORDER BY相关，默认为升序**

```sql
SELECT cookieid
       , createtime
       , pv
       , SUM(pv) OVER(PARTITION BY cookieid ORDER BY createtime) AS pv1 -- 默认为从起点到当前行
       , SUM(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS pv2 -- 从起点到当前行，结果同pv1 
       , SUM(pv) OVER(PARTITION BY cookieid) AS pv3 -- 分组内所有行
       , SUM(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) AS pv4   -- 当前行+往前3行
       , SUM(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND 1 FOLLOWING) AS pv5   -- 当前行+往前3行+往后1行
       , SUM(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS pv6   -- 当前行+往后所有行 
FROM lxw1234;
 
cookieid createtime     pv      pv1     pv2     pv3     pv4     pv5      pv6 
-----------------------------------------------------------------------------
cookie1  2015-04-10      1       1       1       26      1       6       26
cookie1  2015-04-11      5       6       6       26      6       13      25
cookie1  2015-04-12      7       13      13      26      13      16      20
cookie1  2015-04-13      3       16      16      26      16      18      13
cookie1  2015-04-14      2       18      18      26      17      21      10
cookie1  2015-04-15      4       22      22      26      16      20      8
cookie1  2015-04-16      4       26      26      26      13      13      4
```

pv1: 分组内从起点到当前行的pv累积，如：11号的pv1=10号的pv+11号的pv, 12号=10号+11号+12号

pv2: 同pv1

pv3: 分组内(cookie1)所有的pv累加

pv4: 分组内当前行+往前3行，如：11号=10号+11号， 12号=10号+11号+12号， 13号=10号+11号+12号+13号， 14号=11号+12号+13号+14号

pv5: 分组内当前行+往前3行+往后1行，如：14号=11号+12号+13号+14号+15号=5+7+3+2+4=21

pv6: 分组内当前行+往后所有行，如：13号=13号+14号+15号+16号=3+2+4+4=13，14号=14号+15号+16号=2+4+4=10

如果不指定ROWS BETWEEN，默认为从起点到当前行;

如果不指定ORDER BY，则将分组内所有值累加;

关键是理解ROWS BETWEEN含义,也叫做WINDOW子句：

- PRECEDING：往前
- FOLLOWING：往后
- CURRENT ROW：当前行
- UNBOUNDED：起点，UNBOUNDED PRECEDING 表示从前面的起点， UNBOUNDED FOLLOWING：表示到后面的终点

### AVG，MIN，MAX

**和SUM用法一样**

```sql
-- AVG
SELECT cookieid
       , createtime
       , pv
       , AVG(pv) OVER(PARTITION BY cookieid ORDER BY createtime) AS pv1 -- 默认为从起点到当前行
       , AVG(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS pv2 -- 从起点到当前行，结果同pv1 
       , AVG(pv) OVER(PARTITION BY cookieid) AS pv3	-- 分组内所有行
       , AVG(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) AS pv4 -- 当前行+往前3行
       , AVG(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND 1 FOLLOWING) AS pv5 -- 当前行+往前3行+往后1行
       , AVG(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS pv6  -- 当前行+往后所有行 
FROM lxw1234; 
cookieid createtime     pv      pv1     pv2     pv3     pv4     pv5      pv6 
-----------------------------------------------------------------------------
cookie1 2015-04-10      1       1.0     1.0     3.71      1.0     3.0     3.7
cookie1 2015-04-11      5       3.0     3.0     3.71      3.0     4.33    4.17
cookie1 2015-04-12      7       4.33    4.33    3.7       4.33    4.0     4.0
cookie1 2015-04-13      3       4.0     4.0     3.71      4.0     3.6     3.25
cookie1 2015-04-14      2       3.6     3.6     3.71      4.25    4.2     3.33
cookie1 2015-04-15      4       3.67    3.67    3.71      4.0     4.0     4.0
cookie1 2015-04-16      4       3.71    3.71    3.71      3.25    3.25    4.0
```

```sql
-- MIN
SELECT cookieid,
       , createtime
       , pv
       , MIN(pv) OVER(PARTITION BY cookieid ORDER BY createtime) AS pv1 -- 默认为从起点到当前行
       , MIN(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS pv2 -- 从起点到当前行，结果同pv1 
       , MIN(pv) OVER(PARTITION BY cookieid) AS pv3  -- 分组内所有行
       , MIN(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) AS pv4  -- 当前行+往前3行
       , MIN(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND 1 FOLLOWING) AS pv5  -- 当前行+往前3行+往后1行
       , MIN(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS pv6  -- 当前行+往后所有行 
FROM lxw1234;
 
cookieid createtime     pv      pv1     pv2     pv3     pv4     pv5      pv6 
-----------------------------------------------------------------------------
cookie1 2015-04-10      1       1       1       1       1       1       1
cookie1 2015-04-11      5       1       1       1       1       1       2
cookie1 2015-04-12      7       1       1       1       1       1       2
cookie1 2015-04-13      3       1       1       1       1       1       2
cookie1 2015-04-14      2       1       1       1       2       2       2
cookie1 2015-04-15      4       1       1       1       2       2       4
cookie1 2015-04-16      4       1       1       1       2       2       4
```

```sql
-- MAX
SELECT cookieid,
       , createtime
       , pv
       , MAX(pv) OVER(PARTITION BY cookieid ORDER BY createtime) AS pv1  -- 默认为从起点到当前行
       , MAX(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS pv2 -- 从起点到当前行，结果同pv1 
       , MAX(pv) OVER(PARTITION BY cookieid) AS pv3 -- 分组内所有行
       , MAX(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) AS pv4 -- 当前行+往前3行
       , MAX(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN 3 PRECEDING AND 1 FOLLOWING) AS pv5 -- 当前行+往前3行+往后1行
       , MAX(pv) OVER(PARTITION BY cookieid ORDER BY createtime ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING) AS pv6 -- 当前行+往后所有行 
FROM lxw1234;
 
cookieid createtime     pv      pv1     pv2     pv3     pv4     pv5      pv6 
-----------------------------------------------------------------------------
cookie1 2015-04-10      1       1       1       7       1       5       7
cookie1 2015-04-11      5       5       5       7       5       7       7
cookie1 2015-04-12      7       7       7       7       7       7       7
cookie1 2015-04-13      3       7       7       7       7       7       4
cookie1 2015-04-14      2       7       7       7       7       7       4
cookie1 2015-04-15      4       7       7       7       7       7       4
cookie1 2015-04-16      4       7       7       7       4       4       4
```