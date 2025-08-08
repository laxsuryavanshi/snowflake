package com.turtleby.idms.multitenancy.resolver;

import org.springframework.lang.NonNull;

@FunctionalInterface
public interface TenantResolver<T> {

  /**
   * Resolves the tenant identifier from the given context.
   *
   * @param context the context from which to resolve the tenant identifier
   * @return the resolved tenant identifier
   */
  String resolveTenantId(@NonNull T context);

}
