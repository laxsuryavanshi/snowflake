package com.turtleby.idms.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Data;

@Data
@Table(name = "user_oauth2_registered_client_map")
public class UserRegisteredClientRel {

  @Id
  private Integer id;
  private Integer userId;
  private String clientId;

}
