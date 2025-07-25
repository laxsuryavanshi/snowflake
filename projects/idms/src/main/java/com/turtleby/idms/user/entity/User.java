package com.turtleby.idms.user.entity;

import java.io.Serializable;
import java.time.Instant;

import org.springframework.data.annotation.Id;

public class User implements Serializable {

  private static final long serialVersionUID = 1L;

  @Id
  private Long id;

  private String username;
  private String password;
  private Instant lastLogin;

  private String firstName;
  private String lastName;

  public Long getId() {
    return id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Instant getLastLogin() {
    return lastLogin;
  }

  public void setLastLogin(Instant lastLogin) {
    this.lastLogin = lastLogin;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  @Override
  public String toString() {
    return "User [id=" + id + ", username=" + username + "]";
  }

}
