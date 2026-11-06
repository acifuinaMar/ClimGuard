package com.climguard.alert;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

@Component
public class Security extends OncePerRequestFilter {
    public record Principal(String id, String username, Set<String> roles, Set<String> permissions) {
        public boolean isAdmin() { return roles.stream().anyMatch(r -> r.equalsIgnoreCase("Administrador")); }
        public boolean isOperator() { return isAdmin() || roles.stream().anyMatch(r -> r.equalsIgnoreCase("Operador")); }
    }

    static final String ROLE_URI = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    private final ObjectMapper mapper = new ObjectMapper();
    private final byte[] key; private final String issuer, audience, internalKey;

    public Security(@Value("${climguard.jwt.key}") String key, @Value("${climguard.jwt.issuer}") String issuer,
                    @Value("${climguard.jwt.audience}") String audience, @Value("${climguard.internal-api-key:}") String internalKey) {
        if (key.getBytes(StandardCharsets.UTF_8).length < 32) throw new IllegalStateException("JWT_KEY debe tener al menos 32 bytes");
        this.key = key.getBytes(StandardCharsets.UTF_8); this.issuer = issuer; this.audience = audience; this.internalKey = internalKey;
    }

    /** Valida firma HS256, issuer, audience y expiración; lanza ResponseStatusException 401. */
    Principal verify(String token, Instant now) {
        try {
            String[] p = token.split("\\.");
            if (p.length != 3) throw new IllegalArgumentException("formato");
            Base64.Decoder d = Base64.getUrlDecoder();
            JsonNode h = mapper.readTree(d.decode(p[0]));
            if (!"HS256".equals(h.path("alg").asText())) throw new IllegalArgumentException("alg");
            Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(key, "HmacSHA256"));
            byte[] expected = mac.doFinal((p[0] + "." + p[1]).getBytes(StandardCharsets.US_ASCII));
            if (!MessageDigest.isEqual(expected, d.decode(p[2]))) throw new IllegalArgumentException("firma");
            JsonNode c = mapper.readTree(d.decode(p[1]));
            if (!c.has("exp") || c.get("exp").asLong() + 30 < now.getEpochSecond()) throw new IllegalArgumentException("exp");
            if (!issuer.equals(c.path("iss").asText())) throw new IllegalArgumentException("iss");
            boolean aud = false;
            if (c.path("aud").isArray()) { for (JsonNode a : c.get("aud")) aud |= audience.equals(a.asText()); } else aud = audience.equals(c.path("aud").asText());
            if (!aud) throw new IllegalArgumentException("aud");
            Set<String> roles = new HashSet<>(strings(c.get("role"))); roles.addAll(strings(c.get(ROLE_URI)));
            if (roles.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El token no contiene roles");
            String sub = c.hasNonNull("sub") ? c.get("sub").asText() : c.path("preferred_username").asText("");
            return new Principal(sub, c.path("preferred_username").asText(sub), roles, new HashSet<>(strings(c.get("permissions"))));
        } catch (ResponseStatusException e) { throw e;
        } catch (Exception e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido"); }
    }

    private static List<String> strings(JsonNode n) {
        List<String> out = new ArrayList<>();
        if (n == null || n.isNull()) return out;
        if (n.isArray()) n.forEach(x -> out.add(x.asText())); else out.add(n.asText());
        return out;
    }

    public boolean internalOk(HttpServletRequest req) {
        String given = req.getHeader("X-Internal-Key");
        return !internalKey.isEmpty() && given != null && MessageDigest.isEqual(given.getBytes(StandardCharsets.UTF_8), internalKey.getBytes(StandardCharsets.UTF_8));
    }

    @Override protected boolean shouldNotFilter(HttpServletRequest r) {
        String p = r.getRequestURI(); return p.equals("/health") || p.equals("/ready");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws jakarta.servlet.ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.regionMatches(true, 0, "Bearer ", 0, 7)) {
            try { req.setAttribute("principal", verify(h.substring(7).trim(), Instant.now())); }
            catch (ResponseStatusException e) { res.sendError(e.getStatusCode().value(), e.getReason()); return; }
        }
        chain.doFilter(req, res);
    }

    // --- helpers para controladores ---
    public Principal user(HttpServletRequest req) {
        Object p = req.getAttribute("principal");
        if (p == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token requerido");
        return (Principal) p;
    }
    public Principal operator(HttpServletRequest req) {
        Principal p = user(req);
        if (!p.isOperator()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permiso insuficiente");
        return p;
    }
    public Principal admin(HttpServletRequest req) {
        Principal p = user(req);
        if (!p.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores");
        return p;
    }
}
