package com.turtleby.idms.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisteredClientCreateDto(
    @NotBlank String clientName,
    @NotBlank String redirectUris,
    @NotBlank String postLogoutRedirectUris,
    @NotBlank String authorizationGrantTypes,
    @NotBlank String scopes) {
}
