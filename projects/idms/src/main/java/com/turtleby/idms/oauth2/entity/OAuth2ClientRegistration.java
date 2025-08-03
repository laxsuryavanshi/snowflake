package com.turtleby.idms.oauth2.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("oauth2_client_registration")
public class OAuth2ClientRegistration {

  @Id
  private Long id;

  private String registrationId;

  private String clientId;

  private String clientSecret;

  private boolean enabled;

  public Long getId() {
    return id;
  }

  public String getRegistrationId() {
    return registrationId;
  }

  public void setRegistrationId(String registrationId) {
    this.registrationId = registrationId;
  }

  public String getClientId() {
    return clientId;
  }

  public void setClientId(String clientId) {
    this.clientId = clientId;
  }

  public String getClientSecret() {
    return clientSecret;
  }

  public void setClientSecret(String clientSecret) {
    this.clientSecret = clientSecret;
  }

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  @Override
  public String toString() {
    return "OAuth2ClientRegistration [registrationId=" + registrationId + "]";
  }

}
