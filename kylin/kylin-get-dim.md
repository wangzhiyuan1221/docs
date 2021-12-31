# Kylin 获取维度值

#### 常规方式

``` sql
SELECT DISTINCT DIM
FROM t_table
LIMIT 1000
```

在 Kylin 的实际开发中发现这种方式获取速度很慢（秒级），同时在源数据量大的情况下，还会报错，如下：

```
Coprocessor resource limit exceeded: scanned bytes 3221225472 exceeds threshold 3221225472 while executing SQL: "SELECT DISTINCT DIM FROM t_table LIMIT 1000"
```

具体的原因是，触发了相关的查询限制，超过了最大查询扫描字节数，相关限制如下：

```
kylin.query.timeout-seconds: 设置查询超时时间，默认值为 0，即没有限制，如果设置的值小于 60，会被强制替换成 60 秒
kylin.query.timeout-seconds-coefficient: 设置查询超时秒数的系数，默认值为 0.5
kylin.query.max-scan-bytes: 设置查询扫描字节的上限，默认值为 0，即没有上限
kylin.storage.partition.max-scan-bytes: 设置查询扫描的最大字节数，默认值为 3221225472(bytes)，即 3GB
kylin.query.max-return-rows: 指定查询返回行数的限制，默认值为 5000000

```

#### 查询优化

Kylin 是对指定的维度进行组合，然后预聚合，所以在查询相应维度的聚合数据时，当命中相应的 cube 时，查询速度式非常快的。那么，是否可以先查询当前维度的聚合数据，然后在从聚合数据中查询想要的维度值，如下：

``` sql
SELECT DIM
FROM (
  SELECT DIM, COUNT(1)
  FROM t_table
  GROUP BY DIM
) a
LIMIT 1000
```

最终测试的结果是查询耗时为毫秒级