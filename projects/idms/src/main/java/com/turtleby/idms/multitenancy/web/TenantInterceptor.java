package com.turtleby.idms.multitenancy.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.turtleby.idms.multitenancy.Tenant;
import com.turtleby.idms.multitenancy.TenantDetails;
import com.turtleby.idms.multitenancy.context.TenantContext;
import com.turtleby.idms.multitenancy.context.TenantContextHolder;
import com.turtleby.idms.multitenancy.resolver.TenantResolver;

@Component
public class TenantInterceptor implements HandlerInterceptor {

  private final TenantResolver<HttpServletRequest> tenantResolver;

  public TenantInterceptor(TenantResolver<HttpServletRequest> tenantResolver) {
    this.tenantResolver = tenantResolver;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    String tenantId = tenantResolver.resolveTenantId(request);
    Tenant tenant = new TenantDetails(tenantId);
    TenantContextHolder.setContext(new TenantContext(tenant));
    return true;
  }

  @Override
  public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
      Object handler, Exception ex) throws Exception {
    TenantContextHolder.clearContext();
  }

}
