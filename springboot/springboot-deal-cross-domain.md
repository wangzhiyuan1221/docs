# SpringBoot 处理跨域问题

> SpringBoot 2.4.0 版本解决前后端分离的跨域问题

## 1. 使用 addCorsMappings 方法

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
 		     //.allowedOrigins("*")    // allowCredentials为false时
                .allowedOriginPatterns("*")    // allowCredentials为true时，SpringBoot版本2.4.0及以上
                .allowCredentials(true)
                .allowedMethods("GET", "POST", "DELETE", "PUT", "PATCH")
                .maxAge(3600);
    }
}
```

当allowCredentials为真时，allowedOrigins不能包含特殊值"*"，因为不能在"访问--控制-允许-起源"响应头中设置该值。

要允许凭证到一组起源，显式地列出它们，或者考虑使用"allowedOriginPatterns"代替。

## 2. 使用 CorsFilter 过滤器

使用自定义拦截器时跨域相关配置，如登录拦截，addCorsMappings 方法会失效。

原因是请求经过的先后顺序问题，当请求到来时会先进入拦截器中，而不是进入Mapping映射中，所以返回的头信息中并没有配置的跨域信息。浏览器就会报跨域异常。

```java
@Configuration
public class WebMvcConfiguration extends WebMvcConfigurationSupport {

    private CorsConfiguration corsConfiguration() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOriginPattern("*");  // 允许所有域名访问
        corsConfiguration.addAllowedHeader("*");  // 允许所有请求头
        corsConfiguration.addAllowedMethod("*");  // 允许所有的请求类型
        corsConfiguration.setMaxAge(3600L);
        corsConfiguration.setAllowCredentials(true); // 允许请求携带验证信息（cookie）
        return corsConfiguration;
    }

    @Bean
    public CorsFilter corsFilter() {
        // 存储request与跨域配置信息的容器，基于url的映射
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration());
        return new CorsFilter(source);
    }

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {

        registry.addInterceptor(new LoginInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/", "/index.html", "/css/**", "/js/**", "/img/**");
        super.addInterceptors(registry);
    }
}
```

**参考文章**

[SpringBoot使用addCorsMappings配置跨域的坑](https://segmentfault.com/a/1190000018018849)

[SpringBoot中addCorsMappings配置跨域与拦截器互斥问题的原因研究](https://blog.csdn.net/huangyaa729/article/details/103893660)

[又见跨域大坑....](https://blog.csdn.net/weixin_46522411/article/details/112140858)