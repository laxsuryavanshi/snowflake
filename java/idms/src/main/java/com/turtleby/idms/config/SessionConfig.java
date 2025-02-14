package com.turtleby.idms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession;

@Configuration(proxyBeanMethods = false)
@EnableJdbcHttpSession(tableName = "session")
public class SessionConfig {

}
