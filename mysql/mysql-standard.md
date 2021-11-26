# Mysql 规范

### 整体结构限制

1. 不允许创建分区表
2. 表必须为 innodb 存储引擎
3. 每个表必须有且仅有一个单字段主键
4. 表不允许存在外键
5. 只允许设置为 utf8mb4 字符集，排序字符集必须为 utf8mb4_unicode_ci,utf8mb4_general_ci(默认),utf8mb4_bin 其中一个
6. 表必须存在注释信息

### 列限制
1. 列名禁止设置为MySQL关键字
2. 若表中存在自增列，必须为 int 或 bigint 类型，并且自增列初始值必须为1
3. 每个表最多只能有一个自增列
4. 表中不允许创建 json/enum/set/bit 类型的列
5. 不允许为列单独指定字符集信息
6. 新建表必须存在 create_time 和 update_time 字段，保存记录创建时间和更新时间，类型为 datetime
7. 每个列都必须标识清晰明确的注释信息

### 索引限制
1. 普通索引命名必须以idx_前缀开头，唯一索引必须以uniq_前缀开头
2. 每张表最多允许创建30个索引
3. 每个索引最多允许指定10个字段，并且单字段长度不能超过767 bytes

##### 示例SQL

```sql
CREATE TABLE standard_example(
  `id` BIGINT(11) AUTO_INCREMENT COMMENT '主键',
  `content` VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '附属信息',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最近更新时间',
  PRIMARY KEY(`id`),
  KEY 'idx_create_time'(`create_time`),
  KEY 'idx_update_time'(`update_time`)
)ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='建表规范示例表'
```