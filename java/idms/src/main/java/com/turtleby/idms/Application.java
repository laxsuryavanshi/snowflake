package com.turtleby.idms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.turtleby.idms")
public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
