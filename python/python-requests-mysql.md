# Python 的 requests 和 mysql 的使用

### requests

#### 安装模块

```shell
pip install requests
python -m pip install requests
```

#### 导入模块

```python
import requests
```

#### 发送请求

```python
url = "http://httpbin.org/get"
data = {
    'name': 'Andy',
    'age': 28
}
response = requests.get(url, params=data)
print(response.url)
print(response.text)
print(type(response.text))
print(response.json())
print(json.loads(response.text))
print(type(response.json()))
print(response.json()['args'])
print(type(response.json()['args']))
print(response.json()['args']['age'])
```

我们就可以使用该方式使用以下各种方法

```python
requests.get(‘https://github.com/timeline.json’)     # GET请求
requests.post(“http://httpbin.org/post”)             # POST请求
requests.put(“http://httpbin.org/put”)               # PUT请求
requests.delete(“http://httpbin.org/delete”)         # DELETE请求
requests.head(“http://httpbin.org/get”)              # HEAD请求
requests.options(“http://httpbin.org/get” )          # OPTIONS请求
```

#### 响应的内容

```python
r.encoding              # 获取当前的编码
r.encoding = 'utf-8'    # 设置编码
r.text                  # 以encoding解析返回内容。字符串方式的响应体，会自动根据响应头部的字符编码进行解码。
r.content               # 以字节形式（二进制）返回。字节方式的响应体，会自动为你解码 gzip 和 deflate 压缩。
                          
r.headers               # 以字典对象存储服务器响应头，但是这个字典比较特殊，字典键不区分大小写，若键不存在则返回None
                          
r.status_code           # 响应状态码
r.raw                   # 返回原始响应体，也就是 urllib 的 response 对象，使用 r.raw.read()   
r.ok                    # 查看r.ok的布尔值便可以知道是否登陆成功
                          
r.json()                # Requests中内置的JSON解码器，以json形式返回,前提返回的内容确保是json格式的，不然解析出错会抛异常
r.raise_for_status()    # 失败请求(非200响应)抛出异常
```

#### 定制请求头和cookie信息

```python
header = {'user-agent': 'my-app/0.0.1''}
cookie = {'key':'value'}
r = requests.get('your url',headers=header,cookies=cookie) 
```

示例：

```python
data = {'some': 'data'}
headers = {'content-type': 'application/json',
           'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64;rv:22.0) Gecko/20100101 Firefox/22.0'}
 
r = requests.post('https://api.github.com/some/endpoint', data=data, headers=headers)
print(r.text)
```

### mysql

#### 安装模块

```shell
pip install mysql-connector
python -m pip install mysql-connector
```

#### 导入模块

```python
import mysql.connector
```

#### 创建数据库连接

```python
import mysql.connector
 
conn = mysql.connector.connect(
  host="localhost",       # 数据库主机地址
  user="yourusername",    # 数据库用户名
  passwd="yourpassword"   # 数据库密码
  database='yourdatabase' # 数据库名
)
```

#### 执行sql

```python
cursor = conn.cursor()
sql = "yoursql"
cursor.execute(sql)

# 执行 insert update delete 语句，需要手动提交
conn.commit()
```

### 本地应用

```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-

import requests
import mysql.connector
import json

config = {
    'host': 'ip',
    'port': 3306,
    'user': 'root',
    'password': 'root',
    'database': 'test'
}

conn = mysql.connector.connect(**config)
cursor = conn.cursor()
sql = "select ddate date, item, num, money from test limit 1"
cursor.execute(sql)
resultStr = "date: {date}, item: {item}, num: {num}, money: {money}"
result = ""
for (date, item, num, money) in cursor:
    result += resultStr.format(date=date, item=item, num=num, money=money)
cursor.close()
conn.close()
markdown = {
    "msgtype": "markdown",
    "markdown": {
        "content": result
    }
}
key = "key"
url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key={key}".format(key=key)
response = requests.post(url, json=markdown)
# response.raise_for_status()
print(response.text)
# {"errcode":0,"errmsg":"ok"}
if json.loads(response.text)["errcode"] == 0:
    print("发送成功")
else:
    print("发送失败")

```