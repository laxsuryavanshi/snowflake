package com.turtleby.idms.multitenancy.context;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class TenantContextHolder {

  private static final Log LOG = LogFactory.getLog(TenantContextHolder.class);

  private static final ThreadLocal<TenantContext> contextHolder = new InheritableThreadLocal<>();

  public static TenantContext getContext() {
    return contextHolder.get();
  }

  public static void setContext(TenantContext context) {
    LOG.trace("Setting current tenant context: " + context);
    contextHolder.set(context);
  }

  public static void clearContext() {
    LOG.trace("Clearing current tenant context");
    contextHolder.remove();
  }

}
