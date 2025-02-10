package com.turtleby.idms.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  @Order(Ordered.HIGHEST_PRECEDENCE)
  SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
    OAuth2AuthorizationServerConfigurer configurer = OAuth2AuthorizationServerConfigurer.authorizationServer();

    return httpSecurity
        .securityMatcher(configurer.getEndpointsMatcher())
        .with(configurer, server -> server.oidc(withDefaults()))
        .exceptionHandling(exceptionHandling -> exceptionHandling
            .authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login")))
        .build();
  }

  @Bean
  RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate) {
    return new JdbcRegisteredClientRepository(jdbcTemplate);
  }

  @Bean
  JWKSource<SecurityContext> jwkSource(RSAKeyProperties keyProperties) {
    RSAKey key = new RSAKey.Builder(keyProperties.publicKey())
        .privateKey(keyProperties.privateKey())
        .keyID(keyProperties.kid())
        .build();

    JWKSet jwkSet = new JWKSet(key);

    return new ImmutableJWKSet<>(jwkSet);
  }

}
