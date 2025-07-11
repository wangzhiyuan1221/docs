# Git 笔记

## Centos安装

### 安装命令

```bash
yum install -y git
```

### 配置用户名称

```bash
git config --global user.name "username"
```

### 配置电子邮箱

```bash
git config --global user.email "email"
```

### 配置密钥
- 检查本地 SSH 密钥是否存在：

``` bash
ls -al ~/.ssh
```
- 生成新密钥

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```
- 密钥所在目录
  /root/.ssh/id_rsa
  /root/.ssh/id_rsa.pub
  
- 查看公钥，将id_rsa.pub中的公钥配置在github的Setting->SSH and GPG keys中

```bash
cat ~/.ssh/id_rsa.pub 
```

### 测试连接

```bash
ssh -T git@github.com
```
如果看到类似 Hi username! You've successfully authenticated. 的消息，说明 SSH 配置成功。

## 仓库

### 初始化仓库

```bash
git init
```

### 克隆远程项目

```bash
git clone url
```

### 添加远程关联

```bash
git remote add work url
```

## 代码管理

### 提交

```bash
git add .
git add fileName
git commit -m "commit"
git push work main
```

### 拉取

```bash
git fetch work main
git merge FETCH_HEAD
git pull work main
```

## 命令

### 日志

```bash
git log
```

### 状态

```bash
git status
```

### 提交历史

```bash
git show（最新commit的log）
git show commitId（查看指定commitId）
git show commitId fileName（查看某次commit中具体某个文件的修改）
```

## 问题

### 权限
Permission denied (publickey).
fatal: Could not read from remote repository.

```bash
ssh-agent bash
ssh-add /root/.ssh/id_rsa
```

## 图解

<div style="text-align: center;">

![git 笔记](../_media/git-note.png)

</div>