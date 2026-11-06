package com.climguard.alert;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EnableJpaRepositories(
    basePackageClasses = Repos.class,
    considerNestedRepositories = true
)
@EntityScan(basePackageClasses = {
    Entities.AlertLevel.class,
    Entities.Phenomenon.class,
    Entities.AlertState.class,
    Entities.AlertRule.class,
    Entities.Alert.class,
    Entities.AlertEvent.class
})
public class AlertApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlertApplication.class, args);
    }
}