package com.turtleby.idms.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.turtleby.idms.dto.RegisteredClientCreateDto;
import com.turtleby.idms.entity.UserRegisteredClientRel;
import com.turtleby.idms.repository.UserRegisteredClientRelRepository;
import com.turtleby.idms.security.SecurityUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisteredClientService {

  private static final int CLIENT_ID_LENGTH = 32;
  private static final int CLIENT_SECRET_LENGTH = 64;
  private static final String SEPARATOR = " ";
  private static final Map<String, AuthorizationGrantType> AUTHORIZATION_GRANT_TYPE_MAP = new HashMap<>();
  static {
    AUTHORIZATION_GRANT_TYPE_MAP.put("authorization_code", AuthorizationGrantType.AUTHORIZATION_CODE);
    AUTHORIZATION_GRANT_TYPE_MAP.put("client_credentials", AuthorizationGrantType.CLIENT_CREDENTIALS);
    AUTHORIZATION_GRANT_TYPE_MAP.put(
        "urn:ietf:params:oauth:grant-type:device_code", AuthorizationGrantType.DEVICE_CODE);
    AUTHORIZATION_GRANT_TYPE_MAP.put(
        "urn:ietf:params:oauth:grant-type:jwt-bearer", AuthorizationGrantType.JWT_BEARER);
    AUTHORIZATION_GRANT_TYPE_MAP.put("refresh_token", AuthorizationGrantType.REFRESH_TOKEN);
    AUTHORIZATION_GRANT_TYPE_MAP.put(
        "urn:ietf:params:oauth:grant-type:token-exchange", AuthorizationGrantType.TOKEN_EXCHANGE);
  }

  private final RegisteredClientRepository registeredClientRepository;
  private final UserRegisteredClientRelRepository userRegisteredClientRelRepository;
  private final PasswordEncoder passwordEncoder;

  public RegisteredClient create(RegisteredClientCreateDto createDto) {
    String clientId = RandomStringUtils.secure().next(CLIENT_ID_LENGTH, true, true);
    String clientSecret = RandomStringUtils.secure().next(CLIENT_SECRET_LENGTH, true, true);
    String encodedClientSecret = passwordEncoder.encode(clientSecret);

    RegisteredClient client = createClient(createDto, clientId, encodedClientSecret);
    UserRegisteredClientRel rel = createUserRegisteredClientRel(client.getId());

    registeredClientRepository.save(client);
    userRegisteredClientRelRepository.save(rel);

    RegisteredClient returnValue = RegisteredClient.from(client).clientSecret(clientSecret).build();

    return returnValue;
  }

  private RegisteredClient createClient(RegisteredClientCreateDto createDto, String clientId, String clientSecret) {
    return RegisteredClient.withId(UUID.randomUUID().toString())
        .clientId(clientId)
        .clientIdIssuedAt(Instant.now())
        .clientSecret(clientSecret)
        .clientSecretExpiresAt(null)
        .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
        .clientName(createDto.clientName())
        .redirectUris(uris -> uris.addAll(transformSpaceSeparated(createDto.redirectUris())))
        .postLogoutRedirectUris(uris -> uris.addAll(transformSpaceSeparated(createDto.postLogoutRedirectUris())))
        .scopes(scopes -> scopes.addAll(transformSpaceSeparated(createDto.scopes())))
        .authorizationGrantTypes(types -> types.addAll(
            transformSpaceSeparated(createDto.authorizationGrantTypes()).stream()
                .map(RegisteredClientService::toAuthorizationGrantType)
                .collect(Collectors.toList())))
        .build();
  }

  private UserRegisteredClientRel createUserRegisteredClientRel(String clientId) {
    SecurityUser securityUser = (SecurityUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    UserRegisteredClientRel rel = new UserRegisteredClientRel();
    rel.setUserId(securityUser.getUser().getId());
    rel.setClientId(clientId);

    return rel;
  }

  private List<String> transformSpaceSeparated(String value) {
    Assert.notNull(value, "'value' must not be null");

    return Arrays.asList(value.split(SEPARATOR)).stream().filter(val -> !val.isBlank())
        .collect(Collectors.toList());
  }

  private static AuthorizationGrantType toAuthorizationGrantType(String value) {
    Assert.hasText(value, "'value' must not be empty");

    AuthorizationGrantType grantType = AUTHORIZATION_GRANT_TYPE_MAP.get(value);

    if (grantType == null) {
      throw new IllegalArgumentException();
    }

    return grantType;
  }

}
