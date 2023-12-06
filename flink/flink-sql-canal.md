# Flink SQL 对 Canal 的解析

#### 示例数据

参考文档：[Canal格式的使用方法和类型映射](https://help.aliyun.com/zh/flink/developer-reference/canal)

``` json
{
    "id":0,
    "database":"tdb_qc_digitization",
    "table":"qc_digital_report",
    "pkNames":[
        "id"
    ],
    "isDdl":false,
    "type":"INSERT",
    "es":1701681770872,
    "ts":1701681772854,
    "sql":"",
    "sqlType":{
        "id":-5,
        "qc_code":-5
    },
    "mysqlType":{
        "qc_code":"bigint unsigned",
        "id":"bigint"
    },
    "old":null,
    "data":[
        {
            "id":"6341068275413295046",
            "qc_code":"885822212"
        }
    ]
}
```

#### 可用的元数据

| 键                  | 数据类型              | 说明                                                  |
| ------------------- | --------------------- | ----------------------------------------------------- |
| database            | `STRING NULL`           | 原始数据库。对应于Canal记录中的database字段。         |
| table               | `STRING NULL`           | 原始数据库的表。对应于Canal记录中的table字段。        |
| sql-type            | `MAP<STRING, INT> NULL` | 各种sql类型的映射。对应于Canal记录中的sqlType字段。   |
| pk-names            | `ARRAY<STRING> NULL`    | 主键名称数组。对应于Canal记录中的pkNames字段。        |
| ingestion-timestamp | `TIMESTAMP_LTZ(3) NULL` | 连接器处理事件时的时间戳。对应于Canal记录中的ts字段。 |


#### Canal Json 解析

``` sql
create table hdp_ubu_zhuanzhuan_cdc_binlog_etl(
  `database` string METADATA FROM 'value.database' VIRTUAL
  ,`table` string METADATA FROM 'value.table' VIRTUAL
  ,id bigint  
  ,qc_code bigint 
)with (
    'connector' = 'kafka', 
    'topic' = 'kafka_topic', 
    'properties.bootstrap.servers' =  'localhost:9092',
    'properties.client.id' = 'kafka_client_id',        
    'properties.group.id' = 'kafka_group_id_test', 
    'scan.startup.mode' = 'latest-offset', 
    'format' = 'canal-json',  
	'canal-json.ignore-parse-errors'='true'
);

CREATE TABLE hdp_ubu_zhuanzhuan_cdc_binlog_etl_view (
  `database` string
  ,`table` string
  ,id bigint
  ,qc_code bigint
) WITH (
  'connector' = 'print'
);

insert into hdp_ubu_zhuanzhuan_cdc_binlog_etl_view
select
  `database`
  ,`table`
  ,id
  ,qc_code
from hdp_ubu_zhuanzhuan_cdc_binlog_etl
where `table` = 'qc_digital_report'
;
```

#### Json 解析

##### data 定义为 row 类型

``` sql
create table hdp_ubu_zhuanzhuan_cdc_binlog_etl(
  `database` string
  ,`table` string
  ,`data` ARRAY<row<id string, qc_code string>>
  ,`type` string
)with (
    'connector' = 'kafka', 
    'topic' = 'kafka_topic', 
    'properties.bootstrap.servers' =  'localhost:9092',
    'properties.client.id' = 'kafka_client_id',        
    'properties.group.id' = 'kafka_group_id_test', 
    'scan.startup.mode' = 'latest-offset', 
    'format' = 'json',  
	'json.ignore-parse-errors'='true'
);

CREATE TABLE hdp_ubu_zhuanzhuan_cdc_binlog_etl_view (
  `database` string
  ,`table` string
  ,`data` ARRAY<row<id string, qc_code string>>
  ,id string
  ,qc_code string
  ,`type` string
) WITH (
  'connector' = 'print'
);

insert into hdp_ubu_zhuanzhuan_cdc_binlog_etl_view
select
  `database`
  ,`table`
  ,`data`
  ,`data`[1].id as id
  ,`data`[1].qc_code as qc_code
  ,`type`
from hdp_ubu_zhuanzhuan_cdc_binlog_etl
where `table` = 'qc_digital_report'
;
```

##### data 定义为 map 类型

``` sql
create table hdp_ubu_zhuanzhuan_cdc_binlog_etl(
  `database` string
  ,`table` string
  ,`data` ARRAY<map<string,string>>
  ,`type` string
)with (
    'connector' = 'kafka', 
    'topic' = 'kafka_topic', 
    'properties.bootstrap.servers' =  'localhost:9092',
    'properties.client.id' = 'kafka_client_id',        
    'properties.group.id' = 'kafka_group_id_test', 
    'scan.startup.mode' = 'latest-offset', 
    'format' = 'json',  
	'json.ignore-parse-errors'='true'
);

CREATE TABLE hdp_ubu_zhuanzhuan_cdc_binlog_etl_view (
  `database` string
  ,`table` string
  ,`data` ARRAY<map<string,string>>
  ,id string
  ,qc_code string
  ,`type` string
) WITH (
  'connector' = 'print'
);

insert into hdp_ubu_zhuanzhuan_cdc_binlog_etl_view
select
  `database`
  ,`table`
  ,`data`
  ,`data`[1]['id'] as id
  ,`data`[1]['qc_code'] as qc_code
  ,`type`
from hdp_ubu_zhuanzhuan_cdc_binlog_etl
where `table` = 'qc_digital_report'
;
```