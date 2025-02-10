package com.turtleby.idms.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.turtleby.idms.entity.User;

public interface UserRepository extends CrudRepository<User, Integer> {

  Optional<User> findByUsername(String username);

}
