package com.turtleby.idms.oauth2.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

import com.turtleby.idms.oauth2.repository.DatabaseClientRegistrationRepository;
import com.turtleby.idms.oauth2.repository.OAuth2ClientRegistrationRepository;

@Configuration(proxyBeanMethods = false)
public class OAuth2Config {

  @Bean
  ClientRegistrationRepository clientRegistrationRepository(
      OAuth2ClientRegistrationRepository repository) {
    return new DatabaseClientRegistrationRepository(repository);
  }

}
