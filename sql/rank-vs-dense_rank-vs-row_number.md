# 对比rank, dense_rank, row_number

作者：YJdan

转载于 CSDN (https://blog.csdn.net/The_dream1/article/details/112688151)

## 1. 一道题惹得祸

letcode——185. 部门工资前三高的所有员工，经典TOPN问题！

## 2. 对比 rank, dense_rank, row_number

【题目】
“成绩表”记录了学生的学号，学生选修的课程，以及对应课程的成绩。

为了对学生成绩进行考核，现需要查询每门课程的前3高成绩。

注意：如果出现并列第一的情况，则同为第一名。

![原始表](https://pic.imgdb.cn/item/6322df2016f2c2beb1f6b2b7.png)

【解题思路】

题目要求找出每个课程获得前三高成绩的所有学生。难点在于每个课程前3高成绩。

前3高的成绩意味着要对成绩排名。

专用窗口函数rank, dense_rank, row_number有什么区别呢？

它们的区别我举个例子，你们一下就能看懂：

```sql
select *
       , rank() over (order by 成绩 desc) as ranking
       , dense_rank() over (order by 成绩 desc) as dese_rank
       , row_number() over (order by 成绩 desc) as row_num
from 班级
```

得到结果：

![结果1](https://pic.imgdb.cn/item/6322df2016f2c2beb1f6b2d8.png)

从上面的结果可以看出：

1. rank函数：这个例子中是5位，5位，5位，8位，也就是如果有并列名次的行，会占用下一名次的位置。比如正常排名是1，2，3，4，但是现在前3名是并列的名次，结果是：1，1，1，4。

2. dense_rank函数：这个例子中是5位，5位，5位，6位，也就是如果有并列名次的行，不占用下一名次的位置。比如正常排名是1，2，3，4，但是现在前3名是并列的名次，结果是：1，1，1，2。

3. row_number函数：这个例子中是5位，6位，7位，8位，也就是不考虑并列名次的情况。比如前3名是并列的名次，排名是正常的1，2，3，4。

这三个函数的区别如下：

![结果2](https://pic.imgdb.cn/item/6322df2016f2c2beb1f6b2e8.png)

题目要求“如果出现并列第一的情况，则同为第一名”。所以，我们使用窗口函数dense_rank。

步骤一：按课程分组(partiotion by 课程号)，并按成绩降序排列(order by 成绩 desc)，套入窗口函数的语法，就是下面的sql语句：

```sql
select *
       , dense_rank() over(partition by 课程号 order by 成绩 desc) as排名
from 成绩表
```

运行结果如下：

![结果3](https://pic.imgdb.cn/item/6322df4f16f2c2beb1f6fcda.png)

步骤二：筛选出前3高的成绩，所以我们在上一步基础上加入一个where字句来筛选出符合条件的数据。（where 排名 <= 3）

```sql
select 课程号
       , 学号
       , 成绩
       , 排名 
from (
  select *
         , dense_rank() over (partition by 课程号 order by 成绩 desc) as 排名
  from 成绩表) as aa
where 排名 <= 3
```

## 3. 总结

### 3.1 对比rank, dense_rank, row_number

rank：相同分数，并列排名，按人数后补

dense_rank,：相同分数，并列排名，按排名后补

row_number：相同分数，不并列排名

![结果4](https://pic.imgdb.cn/item/6322df4f16f2c2beb1f6fce4.png)

### 3.2 窗口函数使用模板

```sql
-- topN问题 sql模板
select *
from (
   select * 
          , row_number() over (partition by 要分组的列名 order by 要排序的列名 desc) as 排名
   from 表名) as a
where 排名 <= N
```