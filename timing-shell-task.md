# 定时 shell 脚本

## 备份 Mysql 

> 简介：通过shell脚本定时备份数据库表
> 
> backup4MysqlTable.sh

``` shell
#!/bin/bash

#设置mysql备份目录
folder=/usr/local/backup/mysql
cd $folder
day=`date +%Y%m%d`
rm -rf $day
mkdir $day
cd $day
#数据库服务 ip
host=ip
#用户名
user='user'
#密码
password='password'
#要备份的数据库
db=chronos
#需要备份的 tables
tables=(t_dependency t_task)
# 遍历备份的数据库表
for t in ${tables[@]};
do
    backup_file="${t}.sql"
    if [ ! -e "$backup_file" ];
    then
        rm -f "$backup_file"
    fi
    mysqldump -h${host} -u${user} -p${password}  $db $t > $backup_file
done
#数据要保留的天数
days=15
cd ..
day=`date -d "$days days ago" +%Y%m%d`
#删除相应的文件
rm -rf $day
```

## 删除 Mysql 数据

> 定时删除日志、冗余 mysql 表数据
> 
> clear4MysqlData.sh

``` shell
#!/bin/bash

#数据库服务 ip
host=ip
#用户名
user='user'
#密码
password='password'
# 删除30天前的数据
mysql -h${host} -u${user} -p${password} -e "DELETE FROM chronos.t_execution WHERE DATE_SUB(CURDATE(), INTERVAL 30 DAY) > DATE(submit_time)"
mysql -h${host} -u${user} -p${password} -e "DELETE FROM chronos.t_execution_log WHERE DATE_SUB(CURDATE(), INTERVAL 30 DAY) > DATE(create_time)"
mysql -h${host} -u${user} -p${password} -e "DELETE FROM chronos.t_scheduler WHERE DATE_SUB(CURDATE(), INTERVAL 30 DAY) > DATE(create_time)"		
```

## 删除 Linux 日志文件

> 定时删除 Linux 中的 
>
> clear4ChronosExecsFiles.sh

``` shell
#/bin/bash

# 删除修改时间为三天前的文件
cd /opt/scripts
path='/opt/chronos-1.0/execs'
# 获取2天前日期
dayStr=$(date -d -2day  +%Y-%m-%d)
cd $path
# 获取更新时间为2天前的文件的文件名
fileName=`ls --full-time | grep $dayStr | awk {'print$9'}`
for file in $fileName
do
  rm -rf $file;
done
```