# 神策弹窗功能集成

### 1. 技术文档

https://manual.sensorsdata.cn/sf/latest/popup_integration_android-22256846.html

### 2. 代码示例

在 SensorsFocusAPI 初始化时，可以通过 SFConfigOptions 的 setPopupListener 方法设置弹窗的回调监听。setPopupListener 提供了四个监听接口：

``` java
SensorsFocusAPI.startWithConfigOptions(this, new SFConfigOptions("弹窗服务端地址")
    .setPopupListener(new PopupListener() {
       
        // 设置弹窗加载成功回调，planId 为计划 ID
		@Override
        public void onPopupLoadSuccess(String planId) {} 

        // 设置弹窗加载失败回调 
		@Override
        public void onPopupLoadFailed(String planId, int errorCode, String errorMessage) {}

		// 设置弹窗按钮点击回调，弹窗点击时
        @Override
        public void onPopupClick(String planId, SensorsFocusActionModel actionModel) {
		    switch (actionModel) {
                case OPEN_LINK:
                    // 自定义处理打开链接操作
                    String url = actionModel.getValue();
                    Log.d("PopupClick", "url = " + url);
                    break;
                case COPY:
                    // 自定义处理复制操作
                    String copyText = actionModel.getValue();
                    Log.d("PopupClick", "copyText = " + copyText);
                    break;
                case CLOSE:
                    // 处理 close
                    break;
                case CUSTOMIZE:
                    // 处理自定义操作
                    JSONObject customizeJson = actionModel.getExtra();
                    break;
            }
		}

		// 设置弹窗被关闭回调
        @Override
        public void onPopupClose(String planId) {}
    }));
} 
```

### 3. 自定义功能实现

#### 3.1 领券跳转功能

**自定义字段**

bonus_code  优惠券码

bonus_type   优惠券类型 1购机 2回收 3租赁

jump_url        跳转地址

**api接口**

1购机：/api/bonus/draw_bonus          参数bonus_code (红包计划id，如1369915378511888384)

2回收：/api/bonus/draw_rec_bonus    参数bonus_code (优惠券兑换码，如80afed80cc5f15e)

3租赁：/api/bonus/draw_lease_bonus 参数bonus_id (优惠券id，如289)

**功能流程**

用户已登录：领券成功时，提示toast：领券成功，延时1.5秒，然后通过jump_url跳转；领券失败时，提示toast，使用接口返回的提示语，如“已抢光”，“优惠券已领取过”

用户未登录：先唤起登录半弹窗登录，登录成功时再走领券跳转流程

### 4. 神策自采集的埋点

![埋点采集](https://cdn.jsdelivr.net/gh/wangzhiyuan1221/blogger@main/static_files/img/20210312160036.png)