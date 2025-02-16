package com.turtleby.idms.controller;

import static com.turtleby.idms.common.URIConstants.LOGIN_FORM_URL;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthController {

  @GetMapping(LOGIN_FORM_URL)
  String login() {
    return "login";
  }

}
