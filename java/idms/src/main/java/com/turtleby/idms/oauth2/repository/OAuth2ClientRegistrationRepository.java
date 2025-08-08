package com.turtleby.idms.oauth2.repository;

import java.util.Optional;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;

import com.turtleby.idms.oauth2.entity.OAuth2ClientRegistration;

public interface OAuth2ClientRegistrationRepository
    extends CrudRepository<OAuth2ClientRegistration, Long> {

  @Query("SELECT * FROM oauth2_client_registration WHERE registration_id = :registrationId and enabled = true")
  Optional<OAuth2ClientRegistration> findByRegistrationId(String registrationId);

}
