package com.turtleby.idms.entity;

import java.time.Instant;

import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class User {

  @Id
  private Integer id;
  private String username;
  private String password;
  private String firstName;
  private String lastName;
  private Instant lastLogin;

  @Override
  public String toString() {
    return "User [username=" + username + "]";
  }

}
