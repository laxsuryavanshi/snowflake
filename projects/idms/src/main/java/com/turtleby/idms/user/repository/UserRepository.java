package com.turtleby.idms.user.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.turtleby.idms.user.entity.User;

public interface UserRepository extends CrudRepository<User, Long> {

  Optional<User> findByUsername(String username);

}
