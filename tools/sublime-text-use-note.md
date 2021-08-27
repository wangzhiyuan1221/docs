# Sublime Text快捷键大全

> 来源：Lucida 
> 
> [SublimeText快捷键大全(附GIF演示图)](https://www.xiazaiba.com/jiaocheng/4949.html)

Sublime Text 是码农必备之神器，有助于码农快速开垦，如果掌握了 Sublime 强大的快捷键就可以飞起来了。下面下载吧小编汇总了 Sublime Text 支持的全部快捷键（适用 SublimeText2、SublimeText3 ），帮助大家起飞。

### 一、编辑（Editing）

#### 基本编辑（Basic Editing）

↑↓←→就是↑↓←→，不是 KJHL，（没错我就是在吐槽 Vim，尼玛设成 WSAD 也比这个强啊），粘贴剪切复制均和系统一致。

Ctrl + Enter 在当前行下面新增一行然后跳至该行；Ctrl + Shift + Enter 在当前行上面增加一行并跳至该行。

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/1435887200230896654592.gif)

Ctrl + ←/→进行逐词移动，相应的，Ctrl + Shift + ←/→进行逐词选择。

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/143588720180168585472.gif)

Ctrl + ↑/↓移动当前显示区域，Ctrl + Shift + ↑/↓移动当前行。

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/1435887202536763829248.gif)

#### 选择（Selecting）

Sublime Text 的一大亮点是支持多重选择——同时选择多个区域，然后同时进行编辑。

Ctrl + D 选择当前光标所在的词并高亮该词所有出现的位置，再次 Ctrl + D 选择该词出现的下一个位置，在多重选词的过程中，使用 Ctrl + K 进行跳过，使用 Ctrl + U 进行回退，使用 Esc 退出多重编辑。

多重选词的一大应用场景就是重命名——从而使得代码更加整洁。尽管 Sublime Text 无法像 IDE（例如 Eclipse ）那样进行自动重命名，但我们可以通过多重选词+多重编辑进行直观且便捷的重命名：

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/14358872034897993984.gif)

有时我们需要对一片区域的所有行进行同时编辑，Ctrl + Shift + L可以将当前选中区域打散，然后进行同时编辑：

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/1435887203123731862528.gif)

### 二、查找&替换（Finding&Replacing）

Sublime Text 提供了强大的查找（和替换）功能，为了提供一个清晰的介绍，我将 Sublime Text 的查找功能分为快速查找、标准查找和多文件查找三种类型。

#### 快速查找&替换

多数情况下，我们需要查找文中某个关键字出现的其它位置，这时并不需要重新将该关键字重新输入一遍然后搜索，我们只需要使用 Shift + ←/→或 Ctrl + D 选中关键字，然后F3跳到其下一个出现位置，Shift + F3 跳到其上一个出现位置，此外还可以用 Alt + F3 选中其出现的所有位置（之后可以进行多重编辑，也就是快速替换）。

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/1435887205317658325504.gif)

#### 标准查找&替换

另一种常见的使用场景是搜索某个已知但不在当前显示区域的关键字，这时可以使用 Ctrl + F 调出搜索框进行搜索：

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/143588720659151440896.jpg)

以及使用Ctrl + H进行替换：

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/1435887207452431787264.jpg)

#### 关键字查找&替换

对于普通用户来说，常规的关键字搜索就可以满足其需求：在搜索框输入关键字后 Enter 跳至关键字当前光标的下一个位置，Shift + Enter 跳至上一个位置，Alt + Ente r选中其出现的所有位置（同样的，接下来可以进行快速替换）。

Sublime Text 的查找有不同的模式：Alt + C 切换大小写敏感（Case-sensitive）模式，Alt + W 切换整字匹配（Whole matching）模式，除此之外 Sublime Text 还支持在选中范围内搜索（Search in selection），这个功能没有对应的快捷键，但可以通过以下配置项自动开启。

```
"auto_find_in_selection": true
```

这样之后在选中文本的状态下范围内搜索就会自动开启，配合这个功能，局部重命名（Local Renaming）变的非常方便：

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/1435887207347693520896.gif)

使用 Ctrl + H 进行标准替换，输入替换内容后，使用 Ctrl + Shift + H 替换当前关键字，Ctrl + Alt + Enter 替换所有匹配关键字。

#### 正则表达式查找&替换

正则表达式是非常强大的文本查找&替换工具，Sublime Text 中使用 Alt + R 切换正则匹配模式的开启/关闭。

#### 多文件搜索&替换

使用 Ctrl + Shift + F 开启多文件搜索&替换（注意此快捷键和搜狗输入法的简繁切换快捷键有冲突）：

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/water_143588720820557128704.jpg)

多文件搜索 & 替换默认在当前打开的文件和文件夹进行搜索/替换，我们也可以指定文件/文件夹进行搜索/替换。

#### 跳转（Jumping）

Sublime Text 提供了强大的跳转功能使得我们可以在不同的文件/方法/函数中无缝切换。就我的使用经验而言，目前还没有哪一款编辑器可以在这个方面超越 Sublime Text。

#### 跳转到文件

Ctrl + P 会列出当前打开的文件（或者是当前文件夹的文件），输入文件名然后 Enter 跳转至该文件。

需要注意的是，Sublime Text 使用模糊字符串匹配（Fuzzy String Matching），这也就意味着你可以通过文件名的前缀、首字母或是某部分进行匹配：例如，EIS、Eclip 和S tupid 都可以匹配EclipseIsStupid.java。

#### 跳转到符号

尽管是一个文本编辑器，Sublime Text 能够对代码符号进行一定程度的索引。Ctrl + R 会列出当前文件中的符号（例如类名和函数名，但无法深入到变量名），输入符号名称 Enter 即可以跳转到该处。此外，还可以使用 F12 快速跳转到当前光标所在符号的定义处（Jump to Definition）。

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/1435887210383760378368.gif)

比较有意思的是，对于 Markdown，Ctrl + R 会列出其大纲，非常实用。

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/water_1435887210374229334528.jpg)

#### 跳转到某行

Ctrl + G 然后输入行号以跳转到指定行：

![](https://www.xiazaiba.com/uploadfiles/content/2015/0703/1435887212536988635392.gif)

#### 组合跳转

在 Ctrl + P 匹配到文件后，我们可以进行后续输入以跳转到更精确的位置：

- @ 符号跳转：输入@symbol 跳转到 symbol 符号所在的位置
- \# 关键字跳转：输入#keyword 跳转到 keyword 所在的位置
- : 行号跳转：输入:12跳转到文件的第12行。

所以Sublime Text 把 Ctrl + P 称之为“Go To Anything”，这个功能如此好用，以至于我认为没有其它编辑器能够超越它。

### 三、Sublime全部快捷键汇总

#### 常用快捷键

Ctrl+Shift+P：打开命令面板

Ctrl+P：搜索项目中的文件

Ctrl+G：跳转到第几行

Ctrl+W：关闭当前打开文件

Ctrl+Shift+W：关闭所有打开文件

Ctrl+Shift+V：粘贴并格式化

Ctrl+D：选择单词，重复可增加选择下一个相同的单词

Ctrl+L：选择行，重复可依次增加选择下一行

Ctrl+Shift+L：选择多行

Ctrl+Shift+Enter：在当前行前插入新行

Ctrl+X：删除当前行

Ctrl+M：跳转到对应括号

Ctrl+U：软撤销，撤销光标位置

Ctrl+J：选择标签内容

Ctrl+F：查找内容

Ctrl+Shift+F：查找并替换

Ctrl+H：替换

Ctrl+R：前往 method

Ctrl+N：新建窗口

Ctrl+K+B：开关侧栏

Ctrl+Shift+M：选中当前括号内容，重复可选着括号本身

Ctrl+F2：设置/删除标记

Ctrl+/：注释当前行

Ctrl+Shift+/：当前位置插入注释

Ctrl+Alt+/：块注释，并 Focus 到首行，写注释说明用的

Ctrl+Shift+A：选择当前标签前后，修改标签用的

F11：全屏

Shift+F11：全屏免打扰模式，只编辑当前文件

Alt+F3：选择所有相同的词

Alt+.：闭合标签

Alt+Shift+数字：分屏显示

Alt+数字：切换打开第 N 个文件

Shift+右键拖动：光标多不，用来更改或插入列内容

鼠标的前进后退键可切换 Tab 文件

按Ctrl，依次点击或选取，可需要编辑的多个位置

按Ctrl+Shift+上下键，可替换行

#### 选择类

Ctrl+D 选中光标所占的文本，继续操作则会选中下一个相同的文本。

Alt+F3 选中文本按下快捷键，即可一次性选择全部的相同文本进行同时编辑。举个栗子：快速选中并更改所有相同的变量名、函数名等。

Ctrl+L 选中整行，继续操作则继续选择下一行，效果和 Shift+↓ 效果一样。

Ctrl+Shift+L 先选中多行，再按下快捷键，会在每行行尾插入光标，即可同时编辑这些行。

Ctrl+Shift+M 选择括号内的内容（继续选择父括号）。举个栗子：快速选中删除函数中的代码，重写函数体代码或重写括号内里的内容。

Ctrl+M 光标移动至括号内结束或开始的位置。

Ctrl+Enter 在下一行插入新行。举个栗子：即使光标不在行尾，也能快速向下插入一行。

Ctrl+Shift+Enter 在上一行插入新行。举个栗子：即使光标不在行首，也能快速向上插入一行。

Ctrl+Shift+[ 选中代码，按下快捷键，折叠代码。

Ctrl+Shift+] 选中代码，按下快捷键，展开代码。

Ctrl+K+0 展开所有折叠代码。

Ctrl+← 向左单位性地移动光标，快速移动光标。

Ctrl+→ 向右单位性地移动光标，快速移动光标。

shift+↑ 向上选中多行。

shift+↓ 向下选中多行。

Shift+← 向左选中文本。

Shift+→ 向右选中文本。

Ctrl+Shift+← 向左单位性地选中文本。

Ctrl+Shift+→ 向右单位性地选中文本。

Ctrl+Shift+↑ 将光标所在行和上一行代码互换（将光标所在行插入到上一行之前）。

Ctrl+Shift+↓ 将光标所在行和下一行代码互换（将光标所在行插入到下一行之后）。

Ctrl+Alt+↑ 向上添加多行光标，可同时编辑多行。

Ctrl+Alt+↓ 向下添加多行光标，可同时编辑多行。

#### 编辑类

Ctrl+J 合并选中的多行代码为一行。举个栗子：将多行格式的 CSS 属性合并为一行。

Ctrl+Shift+D 复制光标所在整行，插入到下一行。

Tab 向右缩进。

Shift+Tab 向左缩进。

Ctrl+K+K 从光标处开始删除代码至行尾。

Ctrl+Shift+K 删除整行。

Ctrl+/ 注释单行。

Ctrl+Shift+/ 注释多行。

Ctrl+K+U 转换大写。

Ctrl+K+L 转换小写。

Ctrl+Z 撤销。

Ctrl+Y 恢复撤销。

Ctrl+U 软撤销，感觉和 Ctrl+Z 一样。

Ctrl+F2 设置书签

Ctrl+T 左右字母互换。

F6 单词检测拼写

#### 搜索类

Ctrl+F 打开底部搜索框，查找关键字。

Ctrl+shift+F 在文件夹内查找，与普通编辑器不同的地方是sublime允许添加多个文件夹进行查找，略高端，未研究。

Ctrl+P 打开搜索框。举个栗子：1、输入当前项目中的文件名，快速搜索文件，2、输入@和关键字，查找文件中函数名，3、输入：和数字，跳转到文件中该行代码，4、输入#和关键字，查找变量名。

Ctrl+G 打开搜索框，自动带：，输入数字跳转到该行代码。举个栗子：在页面代码比较长的文件中快速定位。

Ctrl+R 打开搜索框，自动带@，输入关键字，查找文件中的函数名。举个栗子：在函数较多的页面快速查找某个函数。

Ctrl+： 打开搜索框，自动带#，输入关键字，查找文件中的变量名、属性名等。

Ctrl+Shift+P 打开命令框。场景栗子：打开命名框，输入关键字，调用 Sublime Text 或插件的功能，例如使用 package 安装插件。

Esc 退出光标多行选择，退出搜索框，命令框等。

#### 显示类

Ctrl+Tab 按文件浏览过的顺序，切换当前窗口的标签页。

Ctrl+PageDown 向左切换当前窗口的标签页。

Ctrl+PageUp 向右切换当前窗口的标签页。

Alt+Shift+1 窗口分屏，恢复默认1屏（非小键盘的数字）

Alt+Shift+2 左右分屏-2列

Alt+Shift+3 左右分屏-3列

Alt+Shift+4 左右分屏-4列

Alt+Shift+5 等分4屏

Alt+Shift+8 垂直分屏-2屏

Alt+Shift+9 垂直分屏-3屏

Ctrl+K+B 开启/关闭侧边栏。

F11 全屏模式

Shift+F11 免打扰模式