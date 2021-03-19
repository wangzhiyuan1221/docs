# Hive分析窗口函数(三) CUME_DIST,PERCENT_RANK

作者：lxw的大数据田地

转载于博客lxw的大数据田地(http://lxw1234.com/archives/2015/04/185.htm)

**注意： 序列函数不支持WINDOW子句。**

**Hive版本为 apache-hive-0.13.1**

**数据准备：**

```sql
d1,user1,1000
d1,user2,2000
d1,user3,3000
d2,user4,4000
d2,user5,5000
 
CREATE EXTERNAL TABLE lxw1234 (
dept   string,
userid string,
sal    INT
) ROW FORMAT DELIMITED 
FIELDS TERMINATED BY ',' 
stored as textfile location '/tmp/lxw11/';

hive> select * from lxw1234;
OK
d1      user1   1000
d1      user2   2000
d1      user3   3000
d2      user4   4000
d2      user5   5000
```

### CUME_DIST

**CUME_DIST** 小于等于当前值的行数/分组内总行数

> 比如，统计小于等于当前薪水的人数，所占总人数的比例

```sql
SELECT 
  dept
  , userid
  , sal
  , CUME_DIST() OVER(ORDER BY sal) AS rn1
  , CUME_DIST() OVER(PARTITION BY dept ORDER BY sal) AS rn2 
FROM lxw1234;
 
dept    userid   sal   rn1       rn2 
-------------------------------------------
d1      user1   1000    0.2     0.33
d1      user2   2000    0.4     0.67
d1      user3   3000    0.6     1.0
d2      user4   4000    0.8     0.5
d2      user5   5000    1.0     1.0
 
rn1: 没有partition,所有数据均为1组，总行数为5，
     第一行：小于等于1000的行数为1，因此，1/5=0.2
     第三行：小于等于3000的行数为3，因此，3/5=0.6
rn2: 按照部门分组，dpet=d1的行数为3,
     第二行：小于等于2000的行数为2，因此，2/3=0.67
```

### PERCENT_RANK

**PERCENT_RANK** 分组内当前行的RANK值-1/分组内总行数-1

应用场景不了解，可能在一些特殊算法的实现中可以用到吧。

```sql
SELECT 
  dept
  , userid
  , sal
  , PERCENT_RANK() OVER(ORDER BY sal) AS rn1   -- 分组内
  , RANK() OVER(ORDER BY sal) AS rn11,         -- 分组内RANK值
  , SUM(1) OVER(PARTITION BY NULL) AS rn12     -- 分组内总行数
  , PERCENT_RANK() OVER(PARTITION BY dept ORDER BY sal) AS rn2 
FROM lxw1234;
 
dept    userid   sal    rn1    rn11     rn12    rn2
---------------------------------------------------
d1      user1   1000    0.0     1       5       0.0
d1      user2   2000    0.25    2       5       0.5
d1      user3   3000    0.5     3       5       1.0
d2      user4   4000    0.75    4       5       0.0
d2      user5   5000    1.0     5       5       1.0
 
rn1: rn1 = (rn11-1) / (rn12-1) 
	   第一行,(1-1)/(5-1)=0/4=0
	   第二行,(2-1)/(5-1)=1/4=0.25
	   第四行,(4-1)/(5-1)=3/4=0.75
rn2: 按照dept分组，
     dept=d1的总行数为3
     第一行，(1-1)/(3-1)=0
     第三行，(3-1)/(3-1)=1
```
