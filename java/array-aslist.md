# 浅谈Arrays.asList()方法的使用

### 源码

``` java
    /**
     * Returns a fixed-size list backed by the specified array.  (Changes to
     * the returned list "write through" to the array.)  This method acts
     * as bridge between array-based and collection-based APIs, in
     * combination with {@link Collection#toArray}.  The returned list is
     * serializable and implements {@link RandomAccess}.
     *
     * <p>This method also provides a convenient way to create a fixed-size
     * list initialized to contain several elements:
     * <pre>
     *     List&lt;String&gt; stooges = Arrays.asList("Larry", "Moe", "Curly");
     * </pre>
     *
     * @param <T> the class of the objects in the array
     * @param a the array by which the list will be backed
     * @return a list view of the specified array
     */
    @SafeVarargs
    @SuppressWarnings("varargs")
    public static <T> List<T> asList(T... a) {
        return new ArrayList<>(a);
    }
```

### 解读

首先，该方法是将数组转化为list。

有以下几点需要注意：

1. 该方法不适用于基本数据类型（byte,short,int,long,float,double,boolean）
2. 该方法将数组与列表链接起来，当更新其中之一时，另一个自动更新
3. 返回的是固定长度的 list，所以不支持 add 和 remove 方法

### 示例

1. 将数组与列表链接起来，当更新其中之一时，另一个自动更新

``` java
String[] a = new String[]{"1", "2"};
List<String> b = Arrays.asList(a);
List<String> c = new ArrayList<>(Arrays.asList(a));
b.forEach(System.out::println); // 1 2
c.forEach(System.out::println); // 1 2
a[0] = "3";
a[1] = "4";
b.forEach(System.out::println); // 3 4
c.forEach(System.out::println); // 1 2
```

2. 返回的是固定长度的 list，所以不支持 add 和 remove 方法

``` java
String[] a = new String[]{"1", "2"};
        List<String> list = Arrays.asList(a);
        list.add("3");

Exception in thread "main" java.lang.UnsupportedOperationException
	at java.util.AbstractList.add(AbstractList.java:148)
	at java.util.AbstractList.add(AbstractList.java:108)
```