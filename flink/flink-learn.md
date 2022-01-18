# Flink 学习笔记

#### Flink 中文文档

[flink-1.13](https://ci.apache.org/projects/flink/flink-docs-release-1.13/zh/docs/try-flink/local_installation/)

#### Flink 命令

**启动集群**

``` shell
./bin/start-cluster.sh
```
**停止集群**

``` shell
./bin/stop-cluster.sh
```

**Web UI 地址**

http://ip:8081/

**运行简单的程序**

``` shell
./bin/flink run examples/streaming/WordCount.jar
./bin/flink run examples/streaming/SocketWindowWordCount.jar --port 9000
```

**任务运行日志**

flink-root-taskexecutor-xxx-localhost.localdomain.log

#### Flink 开发

**idea 中运行 flink 程序**

需要在 idea 中配置 flink 的运行 jar 包

File -> Project Settings -> Libraries -> +Java (flink-1.13.3安装包下的lib和opt)

**Flink Job 上传的 jar 包保存位置**

[Flink Job上传的jar包保存在哪里](https://www.jianshu.com/p/fc57e584e8d8)

可以通过  Job Manager -> Configuration -> web.tmpdir 查看默认并重新配置，但重启后会删除

自定义配置固定路径，防止重启删除：在 conf/flink-conf.yaml 配置文件中配置 

```
web.upload.dir: /opt/flink-1.13.3/jars 
```

**Flink 引用依赖**

将依赖的相关 jar 包放到 lib（重启 flink 使加载生效）；或者自定义的 sql-lib目录下，启动sql-client时指定自定义 jar 包目录

flink-connector-jdbc_2.12-1.13.3.jar (版本要与flink版本一致)

mysql-connector-java-5.1.46.jar

``` shell
./bin/sql-client.sh -d conf/sql.my.yaml -l sql-libs/
```

#### Flink SQL

```shell
vim /opt/test/flinkTestData.csv
1001,andy,1
1001,kim,2
1002,joy,1

./bin/sql-client.sh
```

``` sql
-- source
create table employee_info(
  emp_id INT,
  name VARCHAR,
  dept_id INT
) with (
  'connector' = 'filesystem',
  'path' = '/opt/test/flinkTestData.csv',
  'format' = 'csv'
);

-- sink
create table department_counts(
  dept_id INT,
  emp_count BIGINT NOT NULL,
  primary key (dept_id) not enforced
) with (
   'connector' = 'jdbc',
   'url' = 'jdbc:mysql://ip:3306/test?useSSL=false&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&autoReconnect=true',
   'table-name' = 'department_counts',
   'username' = 'user',
   'password' = 'pwd',
   'sink.buffer-flush.max-rows' = '0',
   'sink.buffer-flush.interval' = '3s',
   'sink.max-retries' = '3'	
);

INSERT INTO department_counts
SELECT 
   dept_id,
   COUNT(*) as emp_count 
FROM employee_info
group by dept_id;
```

#### Flink 配置

**table 查看模式**

```shell
# changelog  tableau
SET sql-client.execution.result-mode=tableau; 
```

**自定义 jod name**

```shell
SET pipeline.name='job-name';
```
```sql
-- all the following DML statements will use the specified job name.
Flink SQL> 
INSERT INTO department_counts
SELECT 
   dept_id,
   COUNT(*) as emp_count 
FROM employee_info
group by dept_id;
```

```shell
# RESET command to reset this config option
RESET pipeline.name;

# Execute DML statements sync/async
# SQL Client 同步提交sql，等待执行结果，默认为false异步提交任务，返回Jod ID
SET table.dml-sync = true;

# Start a SQL Job from a savepoint 
SET execution.savepoint.path=/tmp/flink-savepoints/savepoint-cca7bc-bb1e257f0dab;
# all the following DML statements will be restroed from the specified savepoint path
Flink SQL> INSERT INTO ...

# RESET command to reset this config option
RESET execution.savepoint.path;
```

**查看配置**

```shell
# set; 查看配置
execution.attached=true
execution.savepoint.ignore-unclaimed-state=false
execution.shutdown-on-attached-exit=false
execution.target=remote
jobmanager.execution.failover-strategy=region
jobmanager.memory.process.size=1600m
jobmanager.rpc.address=localhost
jobmanager.rpc.port=6123
parallelism.default=1
pipeline.classpaths=
pipeline.jars=file:/opt/flink-1.13.3/opt/flink-sql-client_2.11-1.13.3.jar
taskmanager.memory.process.size=1728m
taskmanager.numberOfTaskSlots=1
web.upload.dir=/opt/flink-1.13.3/jars
```

#### 扩展阅读

[深入解读 Flink SQL 1.13](https://iteblog.blog.csdn.net/article/details/118214218)

[Flink SQL Client 综合实战](https://www.jianshu.com/p/93a546093302)

[DataGen 数据生成器](https://nightlies.apache.org/flink/flink-docs-release-1.13/zh/docs/connectors/table/datagen/)