package com.turtleby.idms.multitenancy;

public class TenantDetails implements Tenant {

  private String tenantId;

  public TenantDetails() {
  }

  public TenantDetails(String tenantId) {
    this.tenantId = tenantId;
  }

  @Override
  public String getTenantId() {
    return tenantId;
  }

  public void setTenantId(String tenantId) {
    this.tenantId = tenantId;
  }

  @Override
  public String toString() {
    return "TenantDetails [tenantId=" + tenantId + "]";
  }

}
