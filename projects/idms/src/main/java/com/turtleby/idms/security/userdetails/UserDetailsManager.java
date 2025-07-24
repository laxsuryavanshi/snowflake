package com.turtleby.idms.security.userdetails;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.turtleby.idms.auth.repository.UserRepository;

public class UserDetailsManager implements UserDetailsService {

  private final UserRepository userRepository;

  public UserDetailsManager(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    return userRepository.findByUsername(username)
        .map(SecurityUser::new)
        .orElseThrow(() -> new UsernameNotFoundException("Username '" + username + "' not found"));
  }

}
