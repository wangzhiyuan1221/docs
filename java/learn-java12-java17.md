# 从 Java 12 到 Java 17 那些激动人心的新特性

作者：Christopher Bielak | 译者：屠灵
转载：[InfoQ](https://www.infoq.cn/article/BLUm2GTkPH9u9LfYtczZ)

2021 年 9 月，Oracle 发布了 Java 17，Java 的下一个长期支持版本。如果你在使用 Java 8 或 Java 11，可能不会注意到 Java 12 之后新增的一些很酷的新特性。

因为这是一个很重要的版本，我会突出介绍一些我个人很感兴趣的新特性！

需要注意的是，Java 中的大多数变更首先需要经过“预览”阶段，也就是说它们被添加到一个版本中，但还没有完成。人们可以尝试使用它们，但不建议将其用在生产环境中。

这里所列举的所有特性都已正式添加到 Java 中，并且已经过了预览阶段。

#### 1：封印类

在 Java 15 中处于预览阶段并在 Java 17 中成为正式特性的[封印类](https://openjdk.java.net/jeps/409)，提供了一种新的继承规则限定方法。当你在类或接口前面添加 sealed 关键字的同时，也添加了一个允许扩展这个类或实现这个接口的类的清单。例如，如果你定义了一个类：

```java
public abstract sealed class Color permits Red, Blue, Yellow
```

也就是说，只有 Red、Blue 和 Yellow 可以继承这个类，其他类想要继承它都无法通过编译。

你也可以不使用 permits 关键字，然后将类定义与类放在相同的文件中，如下所示：

```java
public abstract sealed class Color {...}
... class Red     extends Color {...}
... class Blue    extends Color {...}
... class Yellow  extends Color {...}
```

注意，这些子类并不是嵌套在封印类中，而是放在类定义之后。这与使用关键字 permit 是一样的效果，可以扩展 Color 的类只有 Red、Blue 和 Yellow。

那么，封印类通常用在哪里？通过限定继承规则，同时也限定了封装规则。假设你正在开发一个库，并且需要将抽象类 Color 包含在其中。你知道 Color 这个类以及哪些类需要扩展它，但如果它被声明为 public 的，那么你有什么办法可以阻止外部代码扩展它？

如果有人误解了它的用途并用 Square 对它进行了扩展，该怎么办？这符合你的意图吗？或者你其实是想让 Color 保持私有？但即使是这样，包级别的可见性也不能避免所有问题。如果后来有人对这个库进行了扩展了该怎么办？他们如何能够知道你只打算让一小部分类集成 Color？

封印类不仅可以保护你的代码不受外部代码的影响，还是一种向你可能从未见过的人传达意图的方式。如果一个类是封印的，你是在传达只有某些类可以扩展它。这种健壮性可以确保在多年以后任何阅读你代码的人都会理解代码的严谨。

#### 2：增强的空指针异常

增强的[空指针异常](https://openjdk.java.net/jeps/358)是一个有趣的更新——不会太复杂，但仍然很受欢迎。这个增强在 Java 14 中正式发布，提高了空指针异常(NullPointerException，简称 NPE)的可读性，可以打印出在抛出异常位置所调用的方法的名称和空变量的名称。例如，如果你调用 a.b.getName()，而 b 为空，那么异常的堆栈跟踪信息会告诉你调用 getName()失败，因为 b 是空的。

我们都知道，NPE 是一种非常常见的异常，虽然在大多数情况下找出导致抛出异常的根源并不难，但你会时不时地遇到同时有两三个可疑变量的情况。你进入调试模式，开始查看代码，但问题很难重现。你只能试着回忆最初做了什么导致抛出 NPE 的。

如果你能提前获得这些信息，就不用这些麻烦地调试了。这就是这个特性的闪光点：不用再猜测 NPE 是从哪里抛出来的。在关键时刻，当你遇到难以重现的异常场景时，你就有了解决问题所需的一切。

这绝对是个救星！

#### 3：switch 表达式

希望你耐心听我说几句——[switch表达式](https://openjdk.java.net/jeps/361)(在 Java 12 中预览，并正式添加到 Java 14 中)是 switch 语句和 lambda 之间的某种结合。真的，当我第一次向别人描述 switch 表达式时，我的说法是他们把 switch 语句 lambda 化了。请看下面这个语法：

```java
String adjacentColor = switch (color) {
    case Blue, Green    -> "yellow";
    case Red, Purple    -> "blue";
    case Yellow, Orange -> "red";
    default             -> "Unknown Color";
};
```

现在明白我的意思了吗？

一个明显的区别是没有了 break 语句。switch 表达式延续了 Oracle 让 Java 语法更简洁的趋势。Oracle 非常讨厌大多数 switch 语句包含很多的 CASE BREAK、CASE BREAK、CASE BREAK……。

老实说，他们讨厌这个是对的，因为人们很容易在这个地方犯错。我们当中是否有人敢说他们从来没有遇到过这种情况：忘记在 switch 里添加 break 语句，只有当代码在运行时发生崩溃才知道？switch 表达式通过一种有趣的方式修复了这个问题，你只需要用逗号隔开同一个代码块里所有的值。没错，不需要使用 break 了！它会替你处理好！

switch 表达式还新增了 yield 关键字。如果一个 case 进入了一个代码块，yield 将被作为 switch 表达式的返回语句。例如，如果我们将上面的代码稍作修改：

```java
String adjacentColor = switch (color) {
    case Blue, Green    -> "yellow";
    case Red, Purple    -> "blue";
    case Yellow, Orange -> "red";
    default             -> {
    System.out.println("The color could not be found.");
    yield "Unknown Color";
  }
};
```

在默认 case 里，System.out.println()方法将被执行，adjacentColor 变量最终的值是“Unknown Color”，因为这是 yield 返回的结果。

总的来说，switch 表达式是一种更简洁的 switch 语句，但它不会取代 switch 语句，这两种语句都可用。

#### 4：文本块

[文本块](https://openjdk.java.net/jeps/378)特性在 Java 13 中预览，并正式添加到 Java 15 中，它可以简化多行字符串的写法，支持换行，并在不需要转义字符的情况下保持缩进。要创建一个文本块，只需要这样：

```java
String text = """
Hello
World""";
```

注意，这个变量仍然是一个字符串，只是它隐含了换行和制表符。同样，如果我们想要使用引号，也不需要转义字符：

```java
String text = """
You can "quote" without complaints!"""; // You can "quote" without complaints!
```

唯一需要使用反斜杠转义字符的地方是当你想要在文本块里包含"""：

```java
String text = """
The only necessary escape is \""",
everything else is maintained.""";
```

除此之外，你可以调用 String 的 format()方法，用动态内容替换文本块中的占位符：

```java
String name = "Chris";
String text = """
My name is %s.""".format(name); // My name is Chris.
```

每行后面的空格都会被剪切掉，除非你指定了'\s'，这是文本块的一个转义字符：

```java
String text1 = """
No trailing spaces.      
Trailing spaces.      \s""";
```

那么，在什么情况下会使用文本块呢？除了能够对大块的文本进行格式化外，将代码片段粘贴到字符串中也变得非常容易。因为缩进被保留了，如果你要写一个 HTML 或 Python 代码块，或使用其他任何语言，你都可以按照正常的方式写好它们，然后用"""把它们括起来，就可以保留代码的格式。你甚至可以用文本块来编写 JSON，并使用 format()方法轻松地插入值。

总的来说，这是个一个很方便的特性。虽然文本块看起来只是一个小功能，但从长远来看，类似这种可以提升开发效率的小功能会逐渐增加。

#### 5：record 类

[record类](https://openjdk.java.net/jeps/395)在 Java 14 中预览，并正式添加到 Java 16 中，是一种数据类，处理所有与 POJO 相关的样板代码。也就是说，如果你声明了一个 record 类：

```java
public record Coord(int x, int y) {
}
```

equals()和 hashcode()方法会自动实现，toString()将返回这个类实例包含的所有字段的值，最重要的是，x()和 y()将分别返回 x 和 y 的值。想想你之前写过的 POJO 类，并想象一下用 record 类来代替它们会怎样。是不是好看多了？省了多少事了？

除此之外，record 类是 final 和不可变的——不能被继承，并且类实例一旦被创建，它的字段就不能被修改。你可以在 record 类中声明方法，包括非静态方法和静态方法：

```java
public record Coord(int x, int y) {
  public boolean isCenter() {
    return x() == 0 && y() == 0;
  }
  
  public static boolean isCenter(Coord coord) {
    return coord.x() == 0 && coord.y() == 0;
  }
}
```

record 类可以有多个构造器：

```java
public record Coord(int x, int y) {
  public Coord() {
    this(0,0); // The default constructor is still implemented.
  }
}
```

需要注意的是，当你在 record 类中声明自定义构造函数时，必须调用默认构造函数。否则，record 类将不知道如何处理它的值。如果你声明了一个与默认构造函数一样的构造函数，你要初始化所有的字段：

```java
public record Coord(int x, int y) {
  public Coord(int x, int y) {
    this.x = x;
    this.y = y;
  } // Will replace the default constructor.
}
```

关于 record 类，有很多可讨论的话题。这是一个大的变更，在合适的地方使用它们，它们会非常有用。我在这里没有涵盖所有内容，但希望这能让你了解它们所提供的能力。

#### 6：模式匹配

[模式匹配](https://openjdk.java.net/jeps/394)是 Oracle 在与 Java 冗长语法的斗争中做出的另一个举措。模式匹配在 Java 14 和 Java 15 中预览过，并正式添加到 Java 16 中，它可以在 instanceof 条件得到满足后消除不必要的类型转换。例如，我们都很熟悉这样的代码：

```java
if (o instanceof Car) {
  System.out.println(((Car) o).getModel());
}
```

如果你想要访问 Car 的方法，必要要这么做。在第二行，o 是 Car 的实例，这是毫无疑问的，instanceof 已经确认了这一点。如果我们使用模式匹配，只要做一个小小的改变：

```java
if (o instanceof Car c) {
  System.out.println(c.getModel());
}
```

现在，所有的对象类型转换都由编译器完成。看起来改变很小，但它避免了很多样板代码。这也适用于条件分支，当你进入一个已经明确了对象类型的分支：

```java
if (!(o instance of Car c)) {
  System.out.println("This isn't a car at all!");
} else {
  System.out.println(c.getModel());
}
```

你甚至可以在 instanceof 那一行使用模式匹配：

```java
public boolean isHonda(Object o) {
  return o instanceof Car c && c.getModel().equals("Honda");
}
```

虽然模式匹配不像其他一些变更那么大，但还是简化了常用的代码。

#### Java 17 将继续演进

当然，Java 12 到 Java 17 并不是只推出了这些更新，这些只是我认为比较有趣的部分。用最新的 Java 版本来运行大型项目需要很大的勇气，如果是从 Java 8 迁移过来，则更需要勇气。

如果有人犹豫不决，是可以理解的。但是，即使你没有迁移计划，或者某个升级计划可能持续数年之久，跟上语言新特性的变化总归是件好事。我希望我分享的这些内容能够让它们更加深入人心，让阅读过这些内容的人都可以开始考虑如何使用它们！

Java 17 很特别——它是下一个长期支持版本，接过了 Java 11 的接力棒，并且很可能在未来几年内成为迁移最多的 Java 版本。即使你现在还没有做好准备，可以开始学习起来了，当你身处基于 Java 17 的项目当中，你已经是一名经验丰富的开发者！

作者简介：

[Christopher Bielak](https://www.linkedin.com/in/christopher-bielak) 是 [Saggezza](https://www.saggezza.com/) (被 Infostretch 收购的一家公司)的 Java 开发人员，他对软件开发语言有浓厚的兴趣。他在银行和金融领域有 10 年的工作经验，倡导向更尖端的技术迈进。

原文链接：

[Six Features From Java 12 to 17 to Get Excited About!](https://www.infoq.com/articles/six-features-jdk12-to-jdk17)