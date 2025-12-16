package com.chess.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner demo(com.chess.backend.repository.UserRepository repository,
			org.springframework.security.crypto.password.PasswordEncoder encoder) {
		return (args) -> {
			System.out.println("Checking DB connection...");
			try {
				if (repository.findByUsername("startup_test").isEmpty()) {
					com.chess.backend.model.entity.User user = new com.chess.backend.model.entity.User();
					user.setUsername("startup_test");
					user.setPassword(encoder.encode("testpass"));
					repository.save(user);
					System.out.println("Startup test user created successfully!");
				} else {
					System.out.println("Startup test user already exists.");
				}
				System.out.println("Total users in DB: " + repository.count());
			} catch (Exception e) {
				System.err.println("Startup DB Test Failed:");
				e.printStackTrace();
			}
		};
	}

}
