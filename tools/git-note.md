# Git 笔记

## Centos安装

### 安装命令
- yum install -y git

### 配置用户名称

- git config --global user.name "username"

### 配置电子邮箱

- git config --global user.email "email"

### 配置密钥

- ssh-keygen -t rsa -C "email"
- /root/.ssh/id_rsa
/root/.ssh/id_rsa.pu
- 将id_rsa.pu中的公钥配置在github的Setting->SSH and GPG keys中

### 测试连接

- ssh git@github.com

## 仓库

### 初始化仓库

- git init

### 克隆远程项目

- git clone url

### 添加远程关联

- git remote add work url

## 代码管理

### 提交

- git add .
git add fileName
- git commit -m "commit"
- git push work main

### 拉取

- git fetch work main
git merge FETCH_HEAD
- git pull work main

## 命令

### 日志
- git log

### 状态
- git status

### 提交历史
- git show（最新commit的log）
- git show commitId（查看指定commitId）
- git show commitId fileName（查看某次commit中具体某个文件的修改）

## 问题

### 权限
Permission denied (publickey).
fatal: Could not read from remote repository.

- ssh-agent bash
- ssh-add /root/.ssh/id_rsa

## 图解

<div style="text-align: center;">

![git 笔记](https://pic.imgdb.cn/item/6322decf16f2c2beb1f62264.png)

</div>