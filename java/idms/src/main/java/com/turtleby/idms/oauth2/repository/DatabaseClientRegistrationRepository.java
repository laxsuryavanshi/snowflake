package com.turtleby.idms.oauth2.repository;

import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

import com.turtleby.idms.oauth2.entity.OAuth2ClientRegistration;

public class DatabaseClientRegistrationRepository implements ClientRegistrationRepository {

  private final OAuth2ClientRegistrationRepository repository;

  public DatabaseClientRegistrationRepository(OAuth2ClientRegistrationRepository repository) {
    this.repository = repository;
  }

  @Override
  public ClientRegistration findByRegistrationId(String registrationId) {
    return repository.findByRegistrationId(registrationId).map(this::toClientRegistration)
        .orElse(null);
  }

  private ClientRegistration toClientRegistration(OAuth2ClientRegistration clientRegistration) {
    if (clientRegistration == null) {
      return null;
    }

    CommonOAuth2Provider commonOAuth2Provider = CommonOAuth2Provider
        .valueOf(clientRegistration.getRegistrationId().toUpperCase());

    return commonOAuth2Provider.getBuilder(clientRegistration.getRegistrationId())
        .clientId(clientRegistration.getClientId())
        .clientSecret(clientRegistration.getClientSecret()).build();
  }

}
