package com.turtleby.idms.multitenancy.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "idms.multitenancy")
public record TenantProperties(Http http, String defaultSchema) {
  private static final String DEFAULT_HEADER_NAME = "X-Tenant-ID";

  public TenantProperties {
    if (http == null) {
      http = new Http(DEFAULT_HEADER_NAME);
    }
    if (defaultSchema == null || defaultSchema.trim().isEmpty()) {
      defaultSchema = "public";
    }
  }

  public record Http(String headerName) {
    public Http {
      if (headerName == null || headerName.trim().isEmpty()) {
        headerName = DEFAULT_HEADER_NAME;
      }
    }
  }
}
