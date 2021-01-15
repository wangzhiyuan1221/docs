# 埋点id标识定义与获取

### 转转的token生成策略

#### Android

<div style="text-align: center;">

![token生成策略](https://wangzhiyuan1221.gitee.io/static/image/bury-get-id_token.png)

</div>

#### iOS

　　token是随机生成的，保存到 苹果设备的钥匙串中。

### OAID定义与生成

　　移动智能终端补充设备标识体系架构共涉及四类实体，包括开发者、开发者开发的应用软件、移动智能终端设备的操作系统、用户及用户使用的设备。为保护用户用户的隐私和标识设备的唯一性，根据不同使用对象和不同用途，基于移动智能终端设备，分别生成设备唯一标识符、匿名设备标识符、开发者匿名设备标识符和应用匿名设备标识符，将这四个设备标识符构成补充设备标识体系。

　　主要涉及到四种设备标识符：设备唯一标识符（UDID）、匿名设备标识符（OAID）、开发者匿名设备标识符（VAID）和应用匿名设备标识符（AAID）。其中匿名设备标识符（OAID）将彻底取代手机IMEI码，第三方开发者将无法再获取用户手机IMEI码极大程度降低第三方应用通知栏PUSH及广告信息骚扰。小米OAID在设备首次启动时立即生成，用户可以自行开启、关闭和重置。

<div style="text-align: center;">

![id生成获取](https://wangzhiyuan1221.gitee.io/static/image/bury-get-id_oaid.jpg)

![四种id的区别](https://wangzhiyuan1221.gitee.io/static/image/bury-get-id_oaid1.png)

![id获取的代码](https://wangzhiyuan1221.gitee.io/static/image/bury-get-id_oaid2.png)

</div>

