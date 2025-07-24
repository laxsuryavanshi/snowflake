package com.turtleby.idms.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import com.turtleby.idms.auth.repository.UserRepository;
import com.turtleby.idms.security.userdetails.UserDetailsManager;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  @Order(1)
  SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity httpSecurity)
      throws Exception {
    OAuth2AuthorizationServerConfigurer configurer = OAuth2AuthorizationServerConfigurer.authorizationServer();

    return httpSecurity
        .securityMatcher(configurer.getEndpointsMatcher())
        .with(configurer, server -> server.oidc(Customizer.withDefaults()))
        .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
        .build();
  }

  @Bean
  @Order(2)
  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
    return httpSecurity
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers("/u/**").authenticated()
            .anyRequest().permitAll())
        .httpBasic(Customizer.withDefaults())
        .build();
  }

  @Bean
  UserDetailsService userDetailsService(UserRepository userRepository) {
    return new UserDetailsManager(userRepository);
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }

}
