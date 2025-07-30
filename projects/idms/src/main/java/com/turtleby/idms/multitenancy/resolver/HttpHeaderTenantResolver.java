package com.turtleby.idms.multitenancy.resolver;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import com.turtleby.idms.multitenancy.config.TenantProperties;

@Component
public class HttpHeaderTenantResolver implements TenantResolver<HttpServletRequest> {

  private final TenantProperties tenantProperties;

  public HttpHeaderTenantResolver(TenantProperties tenantProperties) {
    this.tenantProperties = tenantProperties;
  }

  @Override
  public String resolveTenantId(@NonNull HttpServletRequest request) {
    return request.getHeader(tenantProperties.http().headerName());
  }

}
