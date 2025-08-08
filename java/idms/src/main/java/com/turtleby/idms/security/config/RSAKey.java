package com.turtleby.idms.security.config;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

record RSAKey(RSAPublicKey publicKey, RSAPrivateKey privateKey, String kid) {

}
