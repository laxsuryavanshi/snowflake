package com.turtleby.idms.auth.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.turtleby.idms.auth.entity.User;

public interface UserRepository extends CrudRepository<User, Long> {

  Optional<User> findByUsername(String username);

}
