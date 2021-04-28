# Hive数仓建表该选用ORC还是Parquet，压缩选LZO还是Snappy？

作者：后来X大数据

转载于微信公众号 [Hive数仓建表该选用ORC还是Parquet，压缩选LZO还是Snappy？](https://mp.weixin.qq.com/s?__biz=MzA5NDYyMTU1NQ==&mid=2247484603&idx=1&sn=8722e46430a7b516da64cf72c5040ec3&chksm=904a9ea7a73d17b1ca5ff8bdeac1dc462158b2731c0d5e79f6f82b5bd1242de7d0a4498e682f&scene=178&cur_album_id=1518411517661085696#rd)

> 在数仓中，建议大家除了接口表（从其他数据库导入或者是最后要导出到其他数据库的表），其余表的存储格式与压缩格式保持一致。

我们先来说一下目前 Hive 表主流的存储格式与压缩方式

## 一、文件存储格式

从 Hive 官网得知，Apache Hive 支持 Apache Hadoop 中使用的几种熟悉的文件格式，如 `TextFile（文本格式）`，`RCFile（行列式文件）`，`SequenceFile（二进制序列化文件）`，`AVRO`，`ORC（优化的行列式文件）`和 `Parquet` 格式，而这其中我们目前使用最多的是 `TextFile`， `SequenceFile`，`ORC` 和 `Parquet`。

下面来详细了解下这2种行列式存储。

### 1.1 ORC

#### 1.1.1 ORC 的存储结构

我们先从官网上拿到ORC的存储模型图

![ORC存储模型图](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210428134523.png)

看起来略微有点复杂，那我们稍微简化一下，我画了一个简单的图来说明一下

![ORC 存储模型简化图](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210428134617.png)

左边的图就表示了传统的行式数据库存储方式，按行存储，如果没有存储索引的话，如果需要查询一个字段，就需要把整行的数据都查出来然后做筛选，这么做是比较消耗 IO 资源的，于是在 Hive 中最开始也是用了索引的方式来解决这个问题。

但是由于索引的高成本，在**「目前的Hive3.X 中，已经废除了索引」**，当然也早就引入了列式存储。

列式存储的存储方式，是按照一列一列存储的，如上图中的右图，这样的话如果查询一个字段的数据，就等于是索引查询，效率高。但是如果需要查全表，它因为需要分别取所有的列最后汇总，反而更占用资源。于是 ORC 行列式存储出现了。

1. 在需要全表扫描时，可以按照行组读取
2. 如果需要取列数据，在行组的基础上，读取指定的列，而不需要所有行组内所有行的数据和一行内所有字段的数据。

了解了 ORC 存储的基本逻辑后，我们再来看看它的存储模型图。

![ORC 存储模型图](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210428134846.png)

同时我也把详细的文字也附在下面，大家可以对照着看看：

- 条带( stripe )：ORC 文件存储数据的地方，每个 stripe 一般为 HDFS 的块大小。（包含以下3部分）

```
index data:保存了所在条带的一些统计信息,以及数据在 stripe 中的位置索引信息。
rows data:数据存储的地方,由多个行组构成，每10000行构成一个行组，数据以流( stream )的形式进行存储。
stripe footer:保存数据所在的文件目录
```

- 文件脚注( file footer)：包含了文件中 stripe 的列表，每个 stripe 的行数，以及每个列的数据类型。它还包含每个列的最小值、最大值、行计数、求和等聚合信息。
- postscript：含有压缩参数和压缩大小相关的信息。

所以其实发现，ORC 提供了3级索引，文件级、条带级、行组级，所以在查询的时候，利用这些索引可以规避大部分不满足查询条件的文件和数据块。

但注意，ORC 中所有数据的描述信息都是和存储的数据放在一起的，并没有借助外部的数据库。

**「特别注意：ORC 格式的表还支持事务 ACID ，但是支持事务的表必须为分桶表，所以适用于更新大批量的数据，不建议用事务频繁的更新小批量的数据」**

```sql
-- 开启并发支持,支持插入、删除和更新的事务
set hive.support.concurrency=true
-- 支持 ACID 事务的表必须为分桶表
set hive.enforce.bucketing=true
-- 开启事物需要开启动态分区非严格模式
set hive.exec.dynamic.partition.mode=nonstrict
-- 设置事务所管理类型为 org.apache.hive.q1.lockage.DbTxnManager
-- 原有的org.apache.hadoop.hive.q1.1eckmar.DummyTxnManager不支持事务
set hive.txn.manager=org.apache.hadoop.hive.q1.lockmgr.DbTxnManager
-- 开启在相同的一个 meatore 实例运行初始化和清理的线程
set hive.compactor.initiator.on=true
-- 设置每个 metastore 实例运行的线程数 hadoop
set hive.compactor.worker.threads=l

-- (2)创建表
create table student_txn (
 id   int
,name string
)
-- 必须支持分桶
clustered by (id) into 2 buckets
-- 在表属性中添加支持事务
stored as orc
tblproperties('transactional'='true');

-- (3)插入数据
-- 插入 id 为1001,名字为 student 1001
insert into table student_txn values('1001','student 1001');

-- (4)更新数据
-- 更新数据
update student_txn set name= 'student 1zh' where id='1001';

-- (5)查看表的数据,最终会发现 id 为1001被改为 sutdent_1zh
select id, name from student_txn where id = 1001; 

```

#### 1.2 关于ORC的Hive配置

表配置属性（建表时配置，例如 `tblproperties ('orc.compress'='snappy');`）

- orc.compress：表示 ORC 文件的压缩类型，**「可选的类型有 NONE、ZLB 和 SNAPPY，默认值是 ZLIB（ SNAPPY 不支持切片）」**---这个配置是最关键的
- orc. compress.size：表示压缩块( chunk )的大小，默认值是262144(256KB)
- orc. stripe.size：写 stripe，可以使用的内存缓冲池大小，默认值是67108864(64MB）
- orc. row. index. stride：行组级别索引的数据量大小，默认是10000，必须要设置成大于等于10000的数
- orc. create.index：是否创建行组级别索引，默认是 true
- orc. bloom.filter. columns：需要创建布隆过滤的组
- orc. bloom.filter.fpp：使用布隆过滤器的假正( False Positive)概率，默认值是0

扩展：在 Hive 中使用  bloom 过滤器，可以用较少的文件空间快速判定数据是否存表中，但是也存在将不属于这个表的数据判定为属于这个这表的情况，这个称之为假正概率，开发者可以调整该概率，但概率越低，布隆过滤器所需要空间越大。

### 1.2 Parquet

上面说过 ORC 后，我们对行列式存储也有了基本的了解，而 Parquet 是另一种高性能的行列式存储结构。

#### 1.2.1 Parquet的存储结构

既然 OR C都那么高效了，那为什么还要再来一个 Parquet ，那是因为**「 Parquet 是为了使 Hadoop 生态系统中的任何项目都可以使用压缩的，高效的列式数据表示形式」**

> Parquet 是语言无关的，而且不与任何一种数据处理框架绑定在一起，适配多种语言和组件，能够与 Parquet 配合的组件有：
> 
> 查询引擎：Hive, Impala, Pig, Presto, Drill, Tajo, HAWQ, IBM Big SQL
> 
> 计算框架:：MapReduce, Spark, Cascading, Crunch, Scalding, Kite
> 
> 数据模型：Avro, Thrift, Protocol Buffers, POJOs

再来看看 Parquet 的存储结构吧，先看官网给的

![Parquet 存储结构图](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210428141306.png)

嗯，略微有点头大，我画个简易版

![Parquet 存储结构简易图](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210428141348.png)

Parquet 文件是以二进制方式存储的，所以不可以直接读取，和 ORC 一样，文件的元数据和数据一起存储，所以 Parquet 格式文件是自解析的。

1. 行组( Row Group )：每一个行组包含一定的行数，在一个 HDFS 文件中至少存储一个行组，类似于 ORC 的 stripe 的概念。
2. 列块( Column Chunk )：在一个行组中每一列保存在一个列块中，行组中的所有列连续的存储在这个行组文件中。一个列块中的值都是相同类型的，不同的列块可能使用不同的算法进行压缩。
3. 页( Page )：每一个列块划分为多个页，一个页是最小的编码的单位，在同一个列块的不同页可能使用不同的编码方式。

#### 1.2.2 Parquet 的表配置属性

- parquet.block.size：默认值为134217728byte，即128MB,表示 Row Group在内存中的块大小。该值设置得大，可以提升 Parquet文件的读取效率,但是相应在写的时候需要耗费更多的内存。
- parquet.page.size：默认值为1048576byte，即1MB，表示每个页( page )的大小。这个特指压缩后的页大小，在读取时会先将页的数据进行解压。页是 Parquet 操作数据的最小单位，每次读取时必须读完一整页的数据才能访问数据。这个值如果设置得过小，会导致压缩时出现性能问题。
- parquet.compression：默认值为 UNCOMPRESSED，表示页的压缩方式。**「可以使用的压缩方式有 UNCOMPRESSED、 SNAPPY、GZP 和 LZO」**。
- parquet.enable.dictionary：默认为tue，表示是否启用字典编码。
- parquet.dictionary.page.size：默认值为1048576byte，即1MB。在使用字典编码时，会在 Parquet 的每行每列中创建一个字典页。使用字典编码，如果存储的数据页中重复的数据较多，能够起到一个很好的压缩效果，也能减少每个页在内存的占用。

#### 1.3 ORC 和 Parquet 对比

![ORC 和 Parquet 对比图](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210428143628.png)

![文件大小对比图](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210428143710.png)

同时，从《Hive性能调优实战》作者的案例中，2张分别采用 ORC 和 Parquet 存储格式的表，导入同样的数据，进行 sql 查询，**「发现使用 ORC 读取的行远小于Parquet」**，所以使用 ORC 作为存储，可以借助元数据过滤掉更多不需要的数据，查询时需要的集群资源比 Parquet 更少。（查看更详细的性能分析，请移步https://blog.csdn.net/yu616568/article/details/51188479）

**「所以 ORC 在存储方面看起来还是更胜一筹」**

## 二、压缩方式

![压缩方式对比图](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210428143934.png)

## 三、存储和压缩结合该如何选择?

根据ORC和parquet的要求，一般就有了

### 3.1 ORC 格式存储，Snappy 压缩

```sql
create table stu_orc (
 id   int
,name string
) stored as orc 
tblproperties ('orc.compress'='snappy');
```

### 3.2 Parquet 格式存储，Lzo 压缩

```sql
create table stu_par (
 id   int
,name string
) stored as parquet  
tblproperties ('parquet.compression'='lzo');
```

### 3.3 Parquet 格式存储，Snappy 压缩

```sql
create table stu_par (
 id   int
,name string
) stored as parquet  
tblproperties ('parquet.compression'='snappy');
```

因为 Hive 的 SQL 会转化为 MR 任务，如果该文件是用 ORC 存储，Snappy 压缩的，因为 Snappy 不支持文件分割操作，所以压缩文件**「只会被一个任务所读取」**，如果该压缩文件很大，那么处理该文件的 Map 需要花费的时间会远多于读取普通文件的 Map 时间，这就是常说的**「Map读取文件的数据倾斜」**。

那么为了避免这种情况的发生，就需要在数据压缩的时候采用 bzip2 和 Zip 等支持文件分割的压缩算法。但恰恰 ORC 不支持刚说到的这些压缩方式，所以这也就成为了大家在可能遇到大文件的情况下不选择 ORC 的原因，避免数据倾斜。

在 Hve on Spark 的方式中，也是一样的，Spark 作为分布式架构，通常会尝试从多个不同机器上一起读入数据。要实现这种情况，每个工作节点都必须能够找到一条新记录的开端，也就需要该文件可以进行分割，但是有些不可以分割的压缩格式的文件，必须要单个节点来读入所有数据，这就很容易产生性能瓶颈。(下一篇文章详细写Spark读取文件的源码分析)

**「所以在实际生产中，使用 Parquet 存储，lzo 压缩的方式更为常见，这种情况下可以避免由于读取不可分割大文件引发的数据倾斜。但是，如果数据量并不大（预测不会有超大文件，若干G以上）的情况下，使用 ORC 存储，snappy 压缩的效率还是非常高。」**