# Hive 文件存储格式 (建表 stored as 的五种类型)

作者：小飞猪666

转载于CSDN [Hive文件格式（表stored as 的五种类型）](https://blog.csdn.net/yangshaojun1992/article/details/85124287?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522161959268216780255280448%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=161959268216780255280448&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_v2~rank_v29-1-85124287.nonecase&utm_term=Hive%E6%96%87%E4%BD%B3%E6%A0%BC%E5%BC%8F)

## 一、综述

### 1.1 建表规范

我们知道hive建表的完成格式如下：

```sql
CREATE [EXTERNAL] TABLE [IF NOT EXISTS] table_name      
  [(col_name data_type [COMMENT col_comment], ...)]        
  [COMMENT table_comment]                                    
  [PARTITIONED BY(col_name data_type [COMMENT col_comment], ...)]
  [CLUSTERED BY (col_name, col_name, ...)
  [SORTED BY(col_name [ASC|DESC], ...)] INTO num_buckets BUCKETS]
  [ROW FORMAT row_format] 
  [STORED AS file_format]
  [LOCATION hdfs_path]  
```

其中的可选参数中 `STORED AS` 就是表中的存储格式，例如如果文件数据是纯文本，可以使用 `STORED AS TEXTFILE` 。如果数据需要压缩，使用 `STORED AS SEQUENCEFILE` 。

### 1.2 文件存储格式

hive文件存储格式包括以下几类：

> （1）TEXTFILE </br>
（2）SEQUENCEFILE </br>
（3）RCFILE </br>
（4）ORCFILE (0.11以后出现) </br>
（5）PARQUET </br>

**说明：**</br>
其中TEXTFILE为默认格式，建表时不指定默认为这个格式，导入数据时会直接把数据文件拷贝到hdfs上不进行处理； SEQUENCEFILE，RCFILE，ORCFILE, PARQUET 格式的表不能直接从本地文件导入数据，数据要先导入到 TEXTFILE 格式的表中， 然后再从表中用insert导入 SEQUENCEFILE，RCFILE，ORCFILE, PARQUET 各自表中；或者用复制表结构及数据的方式（ `create table as select * from table` ）。</br>
一言以蔽之：**如果为 TEXTFILE 的文件格式，直接 load 就 OK ，不需要走 MapReduce ；如果是其他的类型就需要走 MapReduce 了，因为其他的类型都涉及到了文件的压缩，这需要借助 MapReduce 的压缩方式来实现**。

## 二、简介

### 2.1 TEXTFILE

默认格式；

存储方式为行存储；

磁盘开销大、数据解析开销大；

使用这种方式，Hive 不会对数据进行切分，从而无法对数据进行并行操作。

### 2.2 SEQUENCEFILE

二进制文件，以<key, value>的形式序列化到文件中；

存储方式：行存储；

可分割、压缩；

一般选择block压缩；

优势是文件和 Hadoop API 中的 MapFile 是相互兼容的。

### 2.3 RCFILE

存储方式：数据按行分块，每块按照列存储；

压缩快、快速列存取；

读记录尽量涉及到的 block 最少；

读取需要的列只需要读取每个 row group 的头部定义；

读取全量数据的操作、性能可能比 SEQUENCEFILE 没有明显的优势。

### 2.4 ORCFILE

存储方式：数据按行分块，每块按照列存储；

压缩快、快速列存取；

效率比 RCFILE 高，是 RCFILE 的改良版本。

### 2.5 PARQUET

类似于 ORCFILE，相对于 ORCFILE 文件格式，Hadoop生态系统中大部分工程都支持 PARQUET 文件。

## 三、主流方式对比（ TEXTFILE 、ORC、PARQUET 三者的对比）

所谓的存储格式就是在 Hive 建表的时候指定的将表中的数据按照什么样子的存储方式，如果指定了 A 方式，那么在向表中插入数据的时候，将会使用该方式向 HDFS 中添加相应的数据类型。例如 TEXTFILE 、SEQUENCEFILE、ORC、PARQUET 这四种存储，前面两种是行式存储，后面两种是列式存储。</br>
**如果为 TEXTFILE 的文件格式，直接 load 就 OK，不需要走 MapReduce ；如果是其他的类型就需要走 MapReduce 了，因为其他的类型都涉及到了文件的压缩，这需要借助 MapReduce 的压缩方式来实现。**

**总结对比：**

> 比对三种主流的文件存储格式 TEXTFILE 、ORC、PARQUET </br>
压缩比：ORC > PARQUET > TEXTFILE（ TEXTFILE 没有进行压缩）</br>
查询速度：三者几乎一致 </br>
HDFS 上显示的是原来的文件名，如果压缩的话，使用类似于 000000_0 的文件名

## 四、使用案例（建表）

### 4.1 TEXTFILE

```sql
-- 创建表，存储数据格式为 TEXTFILE
create table log_text (
 track_time    string
,url           string
,session_id    string
,referer       string
,ip            string
,end_user_id   string
,city_id       string
) row format delimited fields terminated by '\t'
stored as textfile ; 
 
-- 向表中加载数据 
load data local inpath '/opt/module/datas/log.data' into table log_text ;
 
-- 查看表中数据大小 
-- 这个过程不会走 MapReduce，而是直接将文件上传到了HDFS，在 HDFS 上文件的名字还叫 log.data
hive (db_hive)> dfs -du -h /user/hive/warehouse/db_hive.db/log_text;
18.1 M  /user/hive/warehouse/db_hive.db/log_text/log.data
```

### 4.2 ORC

```sql
-- 创建表，存储数据格式为 ORC
create table log_orc (
 track_time    string
,url           string
,session_id    string
,referer       string
,ip            string
,end_user_id   string
,city_id       string
) row format delimited fields terminated by '\t'
stored as orc ; 

-- 向表中加载数据
insert into table log_orc select * from log_text ;

-- 查看表中数据大小
-- 这个过程要走 MapReduce，而且文件是按照列式存储的，还会对文件进行压缩
-- ORC 默认使用的压缩方式是 zlib 因此会更加节省空间，HDFS 上是新的文件名
hive (db_hive)> dfs -du -h /user/hive/warehouse/db_hive.db/log_orc;
2.8 M  /user/hive/warehouse/db_hive.db/log_orc/000000_0
```

### 4.3 PARQUET

```sql
-- 创建表，存储数据格式为 ORC
create table log_parquet (
 track_time    string
,url           string
,session_id    string
,referer       string
,ip            string
,end_user_id   string
,city_id       string
) row format delimited fields terminated by '\t'
stored as parquet ; 

-- 向表中加载数据
insert into table log_parquet select * from log_text ;
 
-- 查看表中数据大小这个过程要走 MapReduce，而且文件是按照列式存储的，因此会更加节省空间
-- HDFS 上是新的文件名
hive (db_hive)> dfs -du -h /user/hive/warehouse/db_hive.db/log_parquet;
13.1 M  /user/hive/warehouse/db_hive.db/log_parquet/000000_0
```

**存储文件的压缩比总结：**</br>
**ORC > PARQUET > TEXTFILE **

```sql
select count(*) from log_text; 
select count(*) from log_orc; 
select count(*) from log_parquet;
```

**存储文件的查询速度总结：查询速度相近。**

## 五、使用案例（压缩和存储的结合）

在建表的时候，如果我们指定了列式存储的方式，他会默认使用对应的压缩方式将我们的数据进行压缩，与此同时我们能够自己定制在文件存储的时候使用什么样子的压缩方式，例子如下：

**以 ORC 存储格式为例**

### 5.1 创建一个非压缩的的 ORC 存储方式

```sql
-- 创建表，存储数据格式为 ORC
create table log_orc_none (
 track_time    string
,url           string
,session_id    string
,referer       string
,ip            string
,end_user_id   string
,city_id       string
) row format delimited fields terminated by '\t'
stored as orc tblproperties ("orc.compress"="NONE") ; 

-- 插入数据
hive (db_hive)> insert into table log_orc_none select * from log_text ;
```

### 5.2 创建一个SNAPPY压缩的ORC存储方式

```sql
-- 创建表，存储数据格式为 ORC
create table log_orc_snappy (
 track_time    string
,url           string
,session_id    string
,referer       string
,ip            string
,end_user_id   string
,city_id       string
) row format delimited fields terminated by '\t'
stored as orc tblproperties ("orc.compress"="SNAPPY") ; 

-- 插入数据
hive (db_hive)> insert into table log_orc_snappy select * from log_text ;
```

### 5.3 创建一个默认压缩的ORC存储方式

```sql
-- 创建表，存储数据格式为 ORC
create table log_orc (
 track_time    string
,url           string
,session_id    string
,referer       string
,ip            string
,end_user_id   string
,city_id       string
) row format delimited fields terminated by '\t'
stored as orc ; 

-- 插入数据
hive (db_hive)> insert into table log_orc select * from log_text ;
```

对比三者的压缩比：

```shell
hive (db_hive)> dfs -du -h /user/hive/warehouse/db_hive.db/log_orc_none;
18.1 M  /user/hive/warehouse/db_hive.db/log_orc_none/log.data
 
hive (db_hive)> dfs -du -h /user/hive/warehouse/db_hive.db/log_orc_snappy;
3.8 M  /user/hive/warehouse/db_hive.db/log_orc_snappy/000000_0
 
hive (db_hive)> dfs -du -h /user/hive/warehouse/db_hive.db/log_orc;
2.8 M  /user/hive/warehouse/db_hive.db/log_orc/000000_0
```

**总结：**

> 没有压缩的 ORC 格式相当于 TEXTFILE，默认的压缩格式压缩比最大，snappy 对数据进行了压缩。</br>
ORC 存储文件默认采用 ZLIB 压缩，ZLIB 采用的是 deflate 压缩算法，因此比 snappy 压缩的小。</br>
文件没有压缩的话，HDFS 上显示的是原来的文件名，如果压缩的话，使用类似于 000000_0 的文件名。

### 5.4 Hive 插入 PARQUET 格式进行压缩

创建 parquet table ：
```sql
create table tabname (
 a int
,b int
) stored as parquet;
```

创建带压缩的 parquet table ：
```sql
create table tabname (
 a int
 ,b int
 ) stored as parquet tblproperties('parquet.compression'='SNAPPY');
```

如果原来创建表的时候没有指定压缩，后续可以通过修改表属性的方式添加压缩：

```sql
ALTER TABLE tabname SET TBLPROPERTIES ('parquet.compression'='SNAPPY');

-- 或者在写入的时候
set parquet.compression=SNAPPY;
```

不过只会影响后续入库的数据，原来的数据不会被压缩，需要重跑原来的数据。

采用压缩之后大概可以降低1/3的存储大小。