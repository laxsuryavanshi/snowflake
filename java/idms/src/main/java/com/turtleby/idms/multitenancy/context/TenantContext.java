package com.turtleby.idms.multitenancy.context;

import java.util.Objects;

import com.turtleby.idms.multitenancy.Tenant;

public class TenantContext {

  private Tenant tenant;

  public TenantContext() {
  }

  public TenantContext(Tenant tenant) {
    this.tenant = tenant;
  }

  public Tenant getTenant() {
    return tenant;
  }

  public void setTenant(Tenant tenant) {
    this.tenant = tenant;
  }

  @Override
  public boolean equals(Object obj) {
    if (obj instanceof TenantContext other) {
      return Objects.equals(tenant, other.tenant);
    }
    return false;
  }

  @Override
  public String toString() {
    return "TenantContext [Tenant=" + tenant + "]";
  }

}
