# MySQL8.0新特性CTE(Common Table Expression)

> CTE(Common Table Expression)可以认为是派生表(derived table)的替代，在一定程度上，CTE简化了复杂的join查询和子查询，提高了SQL的可读性和执行性能。CTE是ANSI SQL 99标准的一部分，在MySQL 8.0.1版本被引入。

## 1. CTE优势

- 查询语句的可读性更好
- 在一个查询中，可以被引用多次
- 能够链接多个CTE
- 能够创建递归查询
- 能够提高SQL执行性能
- 能够有效地替代视图

## 2. 如何创建和使用CTE

CTE类似于使用子查询时的派生表，但是CTE的定义不在SQL主体中，而是提到SQL最前端，声明CTE的需要使用语法WITH。

### 2.1 CTE的使用

先看一个派生表实现的例子：

```sql
SELECT Name
       , Population 
FROM (SELECT * 
      FROM country 
      WHERE continent = 'Europe') AS derived_t
ORDER BY Population DESC LIMIT 5
```

使用CTE改写后，SQL变成这样：

```sql
WITH cte AS (
  SELECT * 
  FROM country 
  WHERE continent = 'Europe') 
SELECT Name
       , Population 
FROM cte 
ORDER BY Population 
DESC LIMIT 5
```

CTE的语法也比较简单，在SQL主体查询之前，使用WITH语法，定义一个或者多个CTE，然后就可以在查询SQL的主体中引用一次或多次CTE，可以把CTE看成是一类提前物化的临时表，以便于查询主体引用。

### 2.2 为CTE指定具体的字段名称

使用圆括号为CTE指定字段名称，如下eur_name和eur_population为CTE的字段：

```sql
WITH cte(eur_name, eur_population) AS (
  SELECT Name
         , Population 
  FROM country 
  WHERE continent = 'Europe')
SELECT eur_name
       , eur_population 
FROM cte
ORDER BY eur_opulation 
DESC LIMIT 5
```

### 2.3 CTE也可以被用作数据源来更新其他表

CTE可以作为数据源，来更新或者删除其他表，如下：

```sql
WITH cte(eur_code, eur_population) AS (
  SELECT Code
         , Population 
  FROM country 
  WHERE continent = 'Europe')  
UPDATE country_2020
       , cte 
SET Population_2020 = ROUND(eur_population*1.1) 
WHERE Code = cte.eur_code

WITH cte AS (
  SELECT Code 
  FROM country 
  WHERE continent <> 'Europe') 
DELETE country_2020 
FROM country_2020, cte 
WHERE country_2020.Code = cte.Code
```

### 2.4 CTE也可以用于insert ... select 语句

```sql
INSERT INTO largest_countries
WITH cte AS (
  SELECT Code
         , Name
         , SurfaceArea 
  FROM country 
  ORDER BY SurfaceArea 
  DESC LIMIT 10)
SELECT * FROM cte
```

### 2.5 CTE作为提前物化的临时表

定义多个CTE，作为提前物化的临时表，在主查询里面可以多次引用这些临时表。如下：

```sql
WITH cte1 AS (SELECT ... FROM ... WHERE ...)
     , cte2 AS (SELECT ... FROM ... WHERE ...)
SELECT ...
FROM table1, table1, cte1, cte2 ....
WHERE .....
```

### 2.6 CTE的可见性

下面两个例子，第一个例子中cte对于顶层SELECT可见，第二个例子中，cte对顶层SELECT不可见。为了避免这种不可见的问题，通常将CTE定义在最前面，以便能够在查询主体的任何地方都能引用到CTE。

```sql
WITH cte AS (
  SELECT Code 
  FROM country 
  WHERE Population < 1000000)
SELECT * 
FROM city 
WHERE city.CountryCode IN (SELECT Code FROM cte)  
-- cte对于顶层SELECT是可见的

SELECT * 
FROM city 
WHERE city.CountryCode IN (
  WITH cte AS (
    SELECT Code 
    FROM country 
    WHERE Population < 1000000)
  SELECT Code FROM cte)  
-- cte对于顶层SELECT不可见
```

### 2.7 CTE引用链

如果在一个查询中创建多个CTE，可能会出现一个CTE引用前一个CTE，导致CTE引用链的产生。下面这个例子展示了CTE引用链：

```sql
WITH density_by_country(country,density) AS (
  SELECT Name
         , Population/SurfaceArea 
  FROM country 
  WHERE Population > 0 and surfacearea > 0)
, max_density(country,maxdensity,label) AS (
  SELECT country
        , density
        , 'max density' 
  FROM density_by_country 
  WHERE density = (
    SELECT MAX(density) 
    FROM density_by_country))
, min_density(country,mindensity,label) AS (
  SELECT country
        , density
        , 'min density' 
  FROM density_by_country 
  WHERE density = (
    SELECT MIN(density) 
    FROM density_by_country)) 
SELECT * 
FROM max_density 
UNION ALL SELECT * FROM min_density
```

上述SQL如果使用派生表的方式改写，也将是非常庞大和复杂的。

### 2.8 使用CTE代替视图

如果你的用户没有权限创建视图，而同时又有需要使用视图，不妨试试CTE来代替视图。

```sql
CREATE VIEW city_pop_by_country AS (
  SELECT countrycode
         , SUM(population) sum_population 
  FROM city
  GROUP BY countrycode)

SELECT name
       , city_pop_by_country.sum_population / country.population ratio 
FROM country, city_pop_by_country 
WHERE country.code = city_pop_by_country.countrycode 
      AND country.population > (SELECT 10 * AVG(sum_population) FROM city_pop_by_country)
```

视图改写为CTE，如下：

```sql
WITH city_pop_by_country AS (
  SELECT countrycode
         , SUM(population) sum_population 
  FROM city GROUP BY countrycode)
SELECT name
       , city_pop_by_country.sum_population / country.population ratio 
FROM country, city_pop_by_country 
WHERE country.code = city_pop_by_country.countrycode 
      AND country.population > (SELECT 10 * AVG(sum_population) FROM city_pop_by_country)
```

使用CTE代替视图能够有效提高执行效率，在本案例中，视图的执行时间大概是0.0097秒，而CTE大概是0.0054秒，CTE更快，因为只需要一次物化临时表，可以被多次引用。

## 3. 总结

在MySQL 8.0 中引入CTE新特性，在大多数场景下，能够简化SQL，提高可读性，同时也能使用CTE代替视图，提高整体性能。另外CTE也能实现递归查询，下一篇文章将详细介绍。

本文译自：

https://www.percona.com/blog/2020/02/10/introduction-to-mysql-8-0-common-table-expressions-part-1/