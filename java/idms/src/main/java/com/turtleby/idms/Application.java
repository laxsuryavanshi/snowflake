package com.turtleby.idms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@EnableConfigurationProperties({
    com.turtleby.idms.security.config.SecurityConfigProperties.class
})
@SpringBootApplication(scanBasePackages = "com.turtleby.idms")
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

}
