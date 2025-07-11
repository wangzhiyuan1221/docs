# Mysql 字符集异常处理

### 异常信息

```
Incorrect string value: '\xF0\x9F\x99\x83' for column
```

### 问题分析
#### 1. 字符集问题
数据库表的字符集可能设置为 latin1 或其他不支持 UTF-8 的字符集。即使数据库表的字符集是 utf8，MySQL 的 utf8 实际上只支持最多 3 字节的字符，而不支持 4 字节的 Unicode 字符（如表情符号）。需要使用 utf8mb4 字符集来支持这些字符。
#### 2. 驱动程序版本
如果使用的 JDBC 驱动程序版本较旧，可能对字符集的支持不够完善，导致插入失败。
#### 3. 客户端和服务器配置不一致
客户端和服务器之间的字符集配置不一致也可能引发此类问题。

### 解决方案
#### 1. 字符集问题
```sql
-- 修改数据库的字符集
  ALTER DATABASE your_database_name CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 修改表的字符集
  ALTER TABLE your_table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 修改特定列的字符集
  ALTER TABLE your_table_name MODIFY your_column_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
#### 2. 驱动程序版本
确保其版本至少为 5.1.13 或更高，并在连接字符串中显式指定字符集
```
useUnicode=true&characterEncoding=UTF-8
````