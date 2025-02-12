package com.turtleby.idms.controller;

import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turtleby.idms.dto.RegisteredClientCreateDto;
import com.turtleby.idms.service.RegisteredClientService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/oauth2client")
@RequiredArgsConstructor
public class RegisteredClientController {

  private final RegisteredClientService registeredClientService;

  @PostMapping
  RegisteredClient create(@Valid @RequestBody RegisteredClientCreateDto createDto) {
    return registeredClientService.create(createDto);
  }

}
