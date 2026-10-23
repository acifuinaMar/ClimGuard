package com.climguard.alert;

import com.climguard.alert.Entities.*;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public final class Repos {
    private Repos() {}
    public interface LevelRepo extends JpaRepository<AlertLevel, Integer> {}
    public interface PhenomenonRepo extends JpaRepository<Phenomenon, Integer> {}
    public interface StateRepo extends JpaRepository<AlertState, Integer> {}
    public interface RuleRepo extends JpaRepository<AlertRule, Long> { List<AlertRule> findByActivoTrue(); }
    public interface EventRepo extends JpaRepository<AlertEvent, Long>, JpaSpecificationExecutor<AlertEvent> {}
    public interface AlertRepo extends JpaRepository<Alert, Long>, JpaSpecificationExecutor<Alert> {
        @Query("select max(a.fechaHora) from Alert a where a.sensorId = :s and a.reglaAlertaId = :r")
        Instant lastAt(@Param("s") Integer sensorId, @Param("r") Long reglaId);
    }
}
