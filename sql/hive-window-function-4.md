# Hive分析窗口函数(四) LAG,LEAD,FIRST_VALUE,LAST_VALUE

作者：lxw的大数据田地

转载于博客lxw的大数据田地(http://lxw1234.com/archives/2015/04/190.htm)

**注意： 序列函数不支持WINDOW子句。**

**Hive版本为 apache-hive-0.13.1**

**数据准备：**

```sql
cookie1,2015-04-10 10:00:02,url2
cookie1,2015-04-10 10:00:00,url1
cookie1,2015-04-10 10:03:04,1url3
cookie1,2015-04-10 10:50:05,url6
cookie1,2015-04-10 11:00:00,url7
cookie1,2015-04-10 10:10:00,url4
cookie1,2015-04-10 10:50:01,url5
cookie2,2015-04-10 10:00:02,url22
cookie2,2015-04-10 10:00:00,url11
cookie2,2015-04-10 10:03:04,1url33
cookie2,2015-04-10 10:50:05,url66
cookie2,2015-04-10 11:00:00,url77
cookie2,2015-04-10 10:10:00,url44
cookie2,2015-04-10 10:50:01,url55
 
CREATE EXTERNAL TABLE lxw1234 (
cookieid   string,
createtime string,  -- 页面访问时间
url        string   -- 被访问页面
) ROW FORMAT DELIMITED 
FIELDS TERMINATED BY ',' 
stored as textfile location '/tmp/lxw11/';

hive> select * from lxw1234;
OK
cookie1 2015-04-10 10:00:02     url2
cookie1 2015-04-10 10:00:00     url1
cookie1 2015-04-10 10:03:04     1url3
cookie1 2015-04-10 10:50:05     url6
cookie1 2015-04-10 11:00:00     url7
cookie1 2015-04-10 10:10:00     url4
cookie1 2015-04-10 10:50:01     url5
cookie2 2015-04-10 10:00:02     url22
cookie2 2015-04-10 10:00:00     url11
cookie2 2015-04-10 10:03:04     1url33
cookie2 2015-04-10 10:50:05     url66
cookie2 2015-04-10 11:00:00     url77
cookie2 2015-04-10 10:10:00     url44
cookie2 2015-04-10 10:50:01     url55
```

### LAG

LAG(col,n,DEFAULT) 用于统计窗口内往上第n行值

第一个参数为列名，第二个参数为往上第n行（可选，默认为1），第三个参数为默认值（当往上第n行为NULL时候，取默认值，如不指定，则为NULL）

```sql
SELECT 
  cookieid
  , createtime
  , url
  , ROW_NUMBER() OVER(PARTITION BY cookieid ORDER BY createtime) AS rn
  , LAG(createtime,1,'1970-01-01 00:00:00') OVER(PARTITION BY cookieid ORDER BY createtime) AS last_1_time
  , LAG(createtime,2) OVER(PARTITION BY cookieid ORDER BY createtime) AS last_2_time 
FROM lxw1234;

cookieid createtime             url    rn       last_1_time             last_2_time
-------------------------------------------------------------------------------------------
cookie1 2015-04-10 10:00:00     url1    1       1970-01-01 00:00:00     NULL
cookie1 2015-04-10 10:00:02     url2    2       2015-04-10 10:00:00     NULL
cookie1 2015-04-10 10:03:04     1url3   3       2015-04-10 10:00:02     2015-04-10 10:00:00
cookie1 2015-04-10 10:10:00     url4    4       2015-04-10 10:03:04     2015-04-10 10:00:02
cookie1 2015-04-10 10:50:01     url5    5       2015-04-10 10:10:00     2015-04-10 10:03:04
cookie1 2015-04-10 10:50:05     url6    6       2015-04-10 10:50:01     2015-04-10 10:10:00
cookie1 2015-04-10 11:00:00     url7    7       2015-04-10 10:50:05     2015-04-10 10:50:01
cookie2 2015-04-10 10:00:00     url11   1       1970-01-01 00:00:00     NULL
cookie2 2015-04-10 10:00:02     url22   2       2015-04-10 10:00:00     NULL
cookie2 2015-04-10 10:03:04     1url33  3       2015-04-10 10:00:02     2015-04-10 10:00:00
cookie2 2015-04-10 10:10:00     url44   4       2015-04-10 10:03:04     2015-04-10 10:00:02
cookie2 2015-04-10 10:50:01     url55   5       2015-04-10 10:10:00     2015-04-10 10:03:04
cookie2 2015-04-10 10:50:05     url66   6       2015-04-10 10:50:01     2015-04-10 10:10:00
cookie2 2015-04-10 11:00:00     url77   7       2015-04-10 10:50:05     2015-04-10 10:50:01
 
 
last_1_time: 指定了往上第1行的值，default为'1970-01-01 00:00:00'  
             cookie1第一行，往上1行为NULL,因此取默认值 1970-01-01 00:00:00
             cookie1第三行，往上1行值为第二行值，2015-04-10 10:00:02
             cookie1第六行，往上1行值为第五行值，2015-04-10 10:50:01
last_2_time: 指定了往上第2行的值，为指定默认值
             cookie1第一行，往上2行为NULL
             cookie1第二行，往上2行为NULL
             cookie1第四行，往上2行为第二行值，2015-04-10 10:00:02
             cookie1第七行，往上2行为第五行值，2015-04-10 10:50:01
```

### LEAD

与LAG相反

LEAD(col,n,DEFAULT) 用于统计窗口内往下第n行值

第一个参数为列名，第二个参数为往下第n行（可选，默认为1），第三个参数为默认值（当往下第n行为NULL时候，取默认值，如不指定，则为NULL）

```sql
SELECT 
  cookieid
  , createtime
  , url
  , ROW_NUMBER() OVER(PARTITION BY cookieid ORDER BY createtime) AS rn,
  , LEAD(createtime,1,'1970-01-01 00:00:00') OVER(PARTITION BY cookieid ORDER BY createtime) AS next_1_time
  , LEAD(createtime,2) OVER(PARTITION BY cookieid ORDER BY createtime) AS next_2_time 
FROM lxw1234;

cookieid createtime             url    rn       next_1_time             next_2_time 
-------------------------------------------------------------------------------------------
cookie1 2015-04-10 10:00:00     url1    1       2015-04-10 10:00:02     2015-04-10 10:03:04
cookie1 2015-04-10 10:00:02     url2    2       2015-04-10 10:03:04     2015-04-10 10:10:00
cookie1 2015-04-10 10:03:04     1url3   3       2015-04-10 10:10:00     2015-04-10 10:50:01
cookie1 2015-04-10 10:10:00     url4    4       2015-04-10 10:50:01     2015-04-10 10:50:05
cookie1 2015-04-10 10:50:01     url5    5       2015-04-10 10:50:05     2015-04-10 11:00:00
cookie1 2015-04-10 10:50:05     url6    6       2015-04-10 11:00:00     NULL
cookie1 2015-04-10 11:00:00     url7    7       1970-01-01 00:00:00     NULL
cookie2 2015-04-10 10:00:00     url11   1       2015-04-10 10:00:02     2015-04-10 10:03:04
cookie2 2015-04-10 10:00:02     url22   2       2015-04-10 10:03:04     2015-04-10 10:10:00
cookie2 2015-04-10 10:03:04     1url33  3       2015-04-10 10:10:00     2015-04-10 10:50:01
cookie2 2015-04-10 10:10:00     url44   4       2015-04-10 10:50:01     2015-04-10 10:50:05
cookie2 2015-04-10 10:50:01     url55   5       2015-04-10 10:50:05     2015-04-10 11:00:00
cookie2 2015-04-10 10:50:05     url66   6       2015-04-10 11:00:00     NULL
cookie2 2015-04-10 11:00:00     url77   7       1970-01-01 00:00:00     NULL
 
-- 逻辑与LAG一样，只不过LAG是往上，LEAD是往下。
```

### FIRST_VALUE

取分组内排序后，截止到当前行，第一个值

```sql
SELECT 
  cookieid
  , createtime
  , url
  , ROW_NUMBER() OVER(PARTITION BY cookieid ORDER BY createtime) AS rn
  , FIRST_VALUE(url) OVER(PARTITION BY cookieid ORDER BY createtime) AS first1 
FROM lxw1234;
 
cookieid  createtime            url     rn      first1
---------------------------------------------------------
cookie1 2015-04-10 10:00:00     url1    1       url1
cookie1 2015-04-10 10:00:02     url2    2       url1
cookie1 2015-04-10 10:03:04     1url3   3       url1
cookie1 2015-04-10 10:10:00     url4    4       url1
cookie1 2015-04-10 10:50:01     url5    5       url1
cookie1 2015-04-10 10:50:05     url6    6       url1
cookie1 2015-04-10 11:00:00     url7    7       url1
cookie2 2015-04-10 10:00:00     url11   1       url11
cookie2 2015-04-10 10:00:02     url22   2       url11
cookie2 2015-04-10 10:03:04     1url33  3       url11
cookie2 2015-04-10 10:10:00     url44   4       url11
cookie2 2015-04-10 10:50:01     url55   5       url11
cookie2 2015-04-10 10:50:05     url66   6       url11
cookie2 2015-04-10 11:00:00     url77   7       url11
```

### LAST_VALUE

取分组内排序后，截止到当前行，最后一个值

```sql
SELECT 
  cookieid
  , createtime
  , url
  , ROW_NUMBER() OVER(PARTITION BY cookieid ORDER BY createtime) AS rn
  , LAST_VALUE(url) OVER(PARTITION BY cookieid ORDER BY createtime) AS last1 
FROM lxw1234;

cookieid  createtime            url    rn       last1  
-----------------------------------------------------------------
cookie1 2015-04-10 10:00:00     url1    1       url1
cookie1 2015-04-10 10:00:02     url2    2       url2
cookie1 2015-04-10 10:03:04     1url3   3       1url3
cookie1 2015-04-10 10:10:00     url4    4       url4
cookie1 2015-04-10 10:50:01     url5    5       url5
cookie1 2015-04-10 10:50:05     url6    6       url6
cookie1 2015-04-10 11:00:00     url7    7       url7
cookie2 2015-04-10 10:00:00     url11   1       url11
cookie2 2015-04-10 10:00:02     url22   2       url22
cookie2 2015-04-10 10:03:04     1url33  3       1url33
cookie2 2015-04-10 10:10:00     url44   4       url44
cookie2 2015-04-10 10:50:01     url55   5       url55
cookie2 2015-04-10 10:50:05     url66   6       url66
cookie2 2015-04-10 11:00:00     url77   7       url77
```

**如果不指定ORDER BY，则默认按照记录在文件中的偏移量进行排序，会出现错误的结果**

```sql
SELECT 
  cookieid
  , createtime
  , url
  , FIRST_VALUE(url) OVER(PARTITION BY cookieid) AS first2  
FROM lxw1234;
 
cookieid  createtime            url     first2
----------------------------------------------
cookie1 2015-04-10 10:00:02     url2    url2
cookie1 2015-04-10 10:00:00     url1    url2
cookie1 2015-04-10 10:03:04     1url3   url2
cookie1 2015-04-10 10:50:05     url6    url2
cookie1 2015-04-10 11:00:00     url7    url2
cookie1 2015-04-10 10:10:00     url4    url2
cookie1 2015-04-10 10:50:01     url5    url2
cookie2 2015-04-10 10:00:02     url22   url22
cookie2 2015-04-10 10:00:00     url11   url22
cookie2 2015-04-10 10:03:04     1url33  url22
cookie2 2015-04-10 10:50:05     url66   url22
cookie2 2015-04-10 11:00:00     url77   url22
cookie2 2015-04-10 10:10:00     url44   url22
cookie2 2015-04-10 10:50:01     url55   url22
 
SELECT 
  cookieid
  , createtime
  , url
  , LAST_VALUE(url) OVER(PARTITION BY cookieid) AS last2  
FROM lxw1234;
 
cookieid  createtime            url     last2
----------------------------------------------
cookie1 2015-04-10 10:00:02     url2    url5
cookie1 2015-04-10 10:00:00     url1    url5
cookie1 2015-04-10 10:03:04     1url3   url5
cookie1 2015-04-10 10:50:05     url6    url5
cookie1 2015-04-10 11:00:00     url7    url5
cookie1 2015-04-10 10:10:00     url4    url5
cookie1 2015-04-10 10:50:01     url5    url5
cookie2 2015-04-10 10:00:02     url22   url55
cookie2 2015-04-10 10:00:00     url11   url55
cookie2 2015-04-10 10:03:04     1url33  url55
cookie2 2015-04-10 10:50:05     url66   url55
cookie2 2015-04-10 11:00:00     url77   url55
cookie2 2015-04-10 10:10:00     url44   url55
cookie2 2015-04-10 10:50:01     url55   url55
```

**如果想要取分组内排序后最后一个值，则需要变通一下：**

```sql
SELECT 
  cookieid
  , createtime
  , url
  , ROW_NUMBER() OVER(PARTITION BY cookieid ORDER BY createtime) AS rn
  , LAST_VALUE(url) OVER(PARTITION BY cookieid ORDER BY createtime) AS last1
  , FIRST_VALUE(url) OVER(PARTITION BY cookieid ORDER BY createtime DESC) AS last2 
FROM lxw1234 
ORDER BY cookieid, createtime;
 
cookieid  createtime            url     rn     last1    last2
-------------------------------------------------------------
cookie1 2015-04-10 10:00:00     url1    1       url1    url7
cookie1 2015-04-10 10:00:02     url2    2       url2    url7
cookie1 2015-04-10 10:03:04     1url3   3       1url3   url7
cookie1 2015-04-10 10:10:00     url4    4       url4    url7
cookie1 2015-04-10 10:50:01     url5    5       url5    url7
cookie1 2015-04-10 10:50:05     url6    6       url6    url7
cookie1 2015-04-10 11:00:00     url7    7       url7    url7
cookie2 2015-04-10 10:00:00     url11   1       url11   url77
cookie2 2015-04-10 10:00:02     url22   2       url22   url77
cookie2 2015-04-10 10:03:04     1url33  3       1url33  url77
cookie2 2015-04-10 10:10:00     url44   4       url44   url77
cookie2 2015-04-10 10:50:01     url55   5       url55   url77
cookie2 2015-04-10 10:50:05     url66   6       url66   url77
cookie2 2015-04-10 11:00:00     url77   7       url77   url77
```

**提示：在使用分析函数的过程中，要特别注意ORDER BY子句，用的不恰当，统计出的结果就不是你所期望的。**