package com.turtleby.idms.config;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "rsa")
public record RSAKeyProperties(RSAPublicKey publicKey, RSAPrivateKey privateKey, String kid) {

}
