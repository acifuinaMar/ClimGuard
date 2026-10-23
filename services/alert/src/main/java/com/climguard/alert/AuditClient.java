package com.climguard.alert;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Envía eventos a Audit Service sin bloquear ni romper el flujo principal. */
@Component
public class AuditClient {
    private static final Logger log = LoggerFactory.getLogger(AuditClient.class);
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
    private final ObjectMapper mapper = new ObjectMapper();
    private final String url, key;

    public AuditClient(@Value("${climguard.audit-url:}") String url, @Value("${climguard.internal-api-key:}") String key) {
        this.url = url; this.key = key;
    }

    public void emit(String action, String resource, String userId, String user, Map<String, Object> detail) {
        if (url.isBlank()) return;
        try {
            String body = mapper.writeValueAsString(Map.of("action", action, "resource", resource, "detail", detail, "userId", userId, "user", user));
            HttpRequest req = HttpRequest.newBuilder(URI.create(url.replaceAll("/$", "") + "/api/audit")).timeout(Duration.ofSeconds(3))
                    .header("Content-Type", "application/json").header("X-Internal-Key", key).POST(HttpRequest.BodyPublishers.ofString(body)).build();
            http.sendAsync(req, HttpResponse.BodyHandlers.discarding()).exceptionally(e -> { log.warn("No se pudo auditar {}: {}", action, e.getClass().getSimpleName()); return null; });
        } catch (Exception e) { log.warn("No se pudo auditar {}: {}", action, e.getClass().getSimpleName()); }
    }
}
