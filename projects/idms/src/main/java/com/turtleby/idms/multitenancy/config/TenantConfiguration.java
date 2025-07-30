package com.turtleby.idms.multitenancy.config;

import javax.sql.DataSource;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.turtleby.idms.multitenancy.datasource.TenantAwareDataSource;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(TenantProperties.class)
public class TenantConfiguration {

  @Bean
  @Primary
  DataSource primaryDataSource(DataSourceProperties dataSourceProperties,
      TenantProperties tenantProperties) {
    DataSource dataSource = dataSourceProperties
        .initializeDataSourceBuilder()
        .build();
    return new TenantAwareDataSource(dataSource, tenantProperties.defaultSchema());
  }

  @Bean(name = "rawDataSource")
  DataSource rawDataSource(DataSourceProperties dataSourceProperties) {
    return dataSourceProperties
        .initializeDataSourceBuilder()
        .build();
  }

}
