# Python 的 requests 使用 - GetImage

通过Python的requests模块爬取下载图片

```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-

import requests
import urllib.request
import os


def get_sougou_image(category, tag, size, pages, path):
    url = "https://pic.sogou.com/pics/channel/getAllRecomPicByTag.jsp"
    params = {
        "category": category,
        "tag": tag,
        "start": 0,
        "len": size,
        "width": 1920,
        "height": 1080
    }
    m = 1
    # 文件目录不存在时，新建目录
    if not os.path.exists(path):
        os.makedirs(path)
    for page in range(0, pages):
        params["start"] = page * size
        print('***** 第' + str(page + 1) + '页 *****' + '   Downloading...')
        response = requests.get(url, params=params)
        data = response.json()
        images = data["all_items"]
        # 无图片数据时，退出循环
        if len(images) == 0:
            break
        images_url = []
        for image in images:
            images_url.append(image["pic_url"])
        for image_url in images_url:
            print('***** ' + image_url + ' *****')
            print('***** ' + str(m) + '.jpg *****' + '   Downloading...')
            urllib.request.urlretrieve(image_url, path + tag + str(m) + '.jpg')
            m += 1
        # 一页图片数不够分页大小时，表示没有下一页了，退出循环
        if len(images_url) < size:
            break

            
get_sougou_image("明星", "全部", 15, 10, "G:/Download/明星/")

```