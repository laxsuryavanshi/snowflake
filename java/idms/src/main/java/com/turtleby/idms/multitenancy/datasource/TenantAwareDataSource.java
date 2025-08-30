package com.turtleby.idms.multitenancy.datasource;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.jdbc.datasource.DelegatingDataSource;
import org.springframework.lang.NonNull;
import org.springframework.util.StringUtils;

import com.turtleby.idms.multitenancy.Tenant;
import com.turtleby.idms.multitenancy.context.TenantContext;
import com.turtleby.idms.multitenancy.context.TenantContextHolder;

public class TenantAwareDataSource extends DelegatingDataSource {

  private static final Log LOG = LogFactory.getLog(TenantAwareDataSource.class);

  private final String defaultSchema;

  public TenantAwareDataSource(DataSource dataSource, String defaultSchema) {
    super(dataSource);
    this.defaultSchema = StringUtils.hasText(defaultSchema) ? defaultSchema : "public";
  }

  @Override
  @NonNull
  public Connection getConnection() throws SQLException {
    return wrapConnection(super.getConnection());
  }

  @Override
  @NonNull
  public Connection getConnection(String username, String password) throws SQLException {
    return wrapConnection(super.getConnection(username, password));
  }

  private Connection wrapConnection(Connection connection) throws SQLException {
    String tenantSchema = defaultSchema;
    TenantContext tenantContext = TenantContextHolder.getContext();
    if (tenantContext != null) {
      tenantSchema = resolveSchema(tenantContext.getTenant());
    }

    // Set search_path immediately on connection establishment
    setSearchPath(connection, tenantSchema);

    return (Connection) Proxy.newProxyInstance(
        Connection.class.getClassLoader(),
        new Class[] { Connection.class },
        new TenantAwareConnectionProxy(connection, tenantSchema));
  }

  private void setSearchPath(Connection connection, String schema) throws SQLException {
    LOG.debug("Setting PostgreSQL search_path to: " + schema);
    try (var statement = connection.createStatement()) {
      statement.execute("SET search_path TO " + schema + ", " + defaultSchema);
    }
  }

  private String resolveSchema(Tenant tenant) {
    if (tenant == null || tenant.getTenantId().isEmpty()) {
      LOG.warn("No tenant found in the context, falling back to default schema: " + defaultSchema);
      return defaultSchema;
    }

    // Sanitize tenant ID to prevent SQL injection
    String sanitizedTenantId = tenant.getTenantId().replaceAll("[^a-zA-Z0-9_]", "");
    if (sanitizedTenantId.isEmpty()) {
      sanitizedTenantId = defaultSchema;
    }

    LOG.debug("Using schema: " + sanitizedTenantId + " for tenant: " + tenant);

    return sanitizedTenantId;
  }

  private class TenantAwareConnectionProxy implements InvocationHandler {
    private final Connection target;

    TenantAwareConnectionProxy(Connection target, String targetSchema) {
      this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
      if ("close".equals(method.getName())) {
        // Reset to default schema before closing
        setSearchPath(target, defaultSchema);
      }

      return method.invoke(target, args);
    }
  }
}
