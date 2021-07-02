# Git 使用笔记

### 1. 查看分支

```shell
# 查看本地分支
git branch 
# 查看所有分支(本地和远程)
git branch -a
```

### 2. 切换分支

```shell
git chechout 分支名
```

### 3. 同步远程新建的分支信息

```shell
# 获取所有分支的更新
git fetch
# 获取指定分支的更新 git fetch <远程主机名> <分支名>
git fetch origin branch2
```

### 4. 拉取其他分支并合并

(xxx1 为自己当前分支，xxx2 为想要拉取合并的分支)

a. 先提交当前分支的代码，为后续切分支做准备

```shell
git add .
git commit -m 'coment'
git push origin xxx1
```

b. 切换到拉取分支 xxx2，拉取分支代码

```shell
git checkout xxx2
git pull origin xxx2
```

c. 切回自己的分支，合并代码
```
git checkout xxx1
git merge xxx2
```

