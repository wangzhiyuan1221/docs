# IDEA开发VUE项目通过@跳转

vue引入组件通常是这样子的

```js
import aaa from '@/aaa/ggg/aaa'
```

但是使用idea开发，按住ctrl点击路径无法跳转

可以这样子，建一个js文件，我把它放在根目录下面（与package.json同级），名字随便起，我这个文件叫做alais.config.js，文件内容是这样的：

```js
/* 此文件未使用，只是为了让idea可以识别实际位置 */
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  resolve: {
    alias: {
      '@': resolve('src')
    }
  }
}

```

然后在idea的settings中配置一下这个文件。

![setting](https://pic.imgdb.cn/item/6322df4f16f2c2beb1f6fcf4.png)

搜索webpack关键词，在Languages & Frameworks这一栏下面有个webpack，具体路径在File | Settings | Languages & Frameworks | JavaScript | Webpack

然后选择webpack的配置文件为我们刚才新建的那个文件。

ok,大功告成，按住ctrl点击路径可以跳转，按住ctrl点击组件的标签也可以跳转。

> 版权声明：本文为weixin_43094917原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接和本声明。
本文链接：https://blog.csdn.net/weixin_43094917/article/details/104498792

