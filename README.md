hjj_firefox_os
==============

红晋江 http://bbs.jjwxc.net 看贴

## 安装

### firefoxos

在firefox market直接安装 [HJJ-firefoxos](https://marketplace.firefox.com/app/hjj/) 

### android

注意：phonegap打包的版本会比从firefox market安装的版本慢

法一：

安装firefox，打开firefox，访问firefox market安装：[HJJ-firefoxos](https://marketplace.firefox.com/app/hjj/)

法二：

安装phonegap打包的 android 版本：[HJJ-phonegap](https://build.phonegap.com/apps/1033213/share)

## 主页

底部按钮：0）打开左边栏；1）收藏的版块；2）收藏的贴子；3）最近访问记录

![home.png](home.png)


## 版块

底部按钮：0）打开左边栏；1）收藏的版块；2）收藏的贴子；3）最近访问记录

![board.png](board.png)

## 贴子

底部首层按钮： 0）打开左边栏；1）只看楼主；2）只看图；3）按字数脱水；4）显示所有楼层

底部二层按钮： 0）跳到顶部；1）往前跳Ｎ楼；2）返回本版；3）往后跳Ｎ楼；4）跳到底部

楼层按钮： 1) 引用此楼内容回帖; 2) 不引用内容直接回复此楼; 3) 标记当前楼层

![showmsg.png](showmsg.png)

### 事件

底部 左/右 侧单击：上一页/下一页

中部 中间 单击：显示/隐藏 底栏

## 黑夜模式

![night.png](night.png)

## 搜索

![search.png](search.png)

## 版块列表

![board_menu.png](board_menu.png)

## 跳转到指定大院/门牌

![manual_jump.png](manual_jump.png)

## 绑定腾讯微博，支持贴图

浏览器打开 http://test.open.t.qq.com ，选择授权方式为``oauth2.0``

![qq_oauth2_1.png](qq_oauth2_1.png)

把授权信息中的``openid``、``appkey``、``access_token``填入app设置页面

![qq_oauth2_2.png](qq_oauth2_2.png)

![qq_oauth2_3.png](qq_oauth2_3.png)

## 推送当前帖子到kindle

用于文库看文。。。

需要搭建在线小说处理服务，参考：[loadxs](https://github.com/abbypan/loadxs)

假设搭建的服务域名为 abc.xxx.com，服务邮箱为 kindle@xxx.com

直接将该域名填入设置页面

并在 amazon 设置允许  kindle@xxx.com 邮箱推送即可

# changelog

v0.8 

新增功能：上传图片（调用腾讯微博接口）

新增功能：记住默认子版块，例如打开XQ只显示贴图区

新增功能：记住贴子默认阅读喜好，例如只看图/只看楼主/自动脱水，刷图/看文专用

bug fix : 左边栏滑出盖住原页面

bug fix : 4寸屏幕手机无法完整显示贴子页底部按钮
