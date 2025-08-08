package com.turtleby.idms.security.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "idms.security")
public record SecurityConfigProperties(List<RSAKey> signingKeys) {

}
