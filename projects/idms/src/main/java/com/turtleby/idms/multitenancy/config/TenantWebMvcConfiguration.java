package com.turtleby.idms.multitenancy.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.turtleby.idms.multitenancy.web.TenantInterceptor;

@Configuration(proxyBeanMethods = false)
public class TenantWebMvcConfiguration implements WebMvcConfigurer {

  private final TenantInterceptor tenantInterceptor;

  public TenantWebMvcConfiguration(TenantInterceptor tenantInterceptor) {
    this.tenantInterceptor = tenantInterceptor;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    // add tenant resolution interceptor
    registry.addInterceptor(tenantInterceptor);
  }

}
