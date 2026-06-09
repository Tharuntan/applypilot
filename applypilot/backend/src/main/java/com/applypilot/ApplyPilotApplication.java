package com.applypilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ApplyPilotApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApplyPilotApplication.class, args);
    }
}
