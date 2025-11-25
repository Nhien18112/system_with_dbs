package com.project.happy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class HappyApplication {

	public static void main(String[] args) {
		SpringApplication.run(HappyApplication.class, args);
	}

}
