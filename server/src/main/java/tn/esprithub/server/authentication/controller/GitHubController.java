package tn.esprithub.server.authentication.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/github")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class GitHubController {

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${spring.security.oauth2.client.registration.github.scope}")
    private String githubScope;

    @Value("${FRONTEND_URL:http://localhost:4200}")
    private String frontendUrl;

    @Value("${github.oauth.redirect-uri:}")
    private String githubOAuthRedirectUri;

    private static final String GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";

    @GetMapping("/auth-url")
    public ResponseEntity<Map<String, String>> getGitHubAuthUrl() {
        String redirectUri = resolveRedirectUri();
        
        log.info("Generating GitHub OAuth URL");
        log.debug("GitHub Client ID: {}", githubClientId);
        log.debug("GitHub Scope: {}", githubScope);
        log.debug("Redirect URI: {}", redirectUri);

        // Generate a random state parameter for security
        String state = UUID.randomUUID().toString();

        // Build the GitHub authorization URL
        String authUrl = GITHUB_AUTH_URL +
                "?client_id=" + githubClientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&scope=" + URLEncoder.encode(githubScope, StandardCharsets.UTF_8) +
                "&prompt=consent" +
                "&state=" + state;

        log.info("Generated GitHub auth URL with state: {}", state);
        log.debug("Full GitHub auth URL: {}", authUrl);

        return ResponseEntity.ok(Map.of(
                "authUrl", authUrl,
                "state", state
        ));
    }

    private String resolveRedirectUri() {
        String normalizedFrontendUrl = normalizeUrl(frontendUrl, "http://localhost:4200");
        String defaultRedirectUri = normalizedFrontendUrl + "/auth/github/callback";
        String configuredRedirectUri = normalizeUrl(githubOAuthRedirectUri, "");

        if (configuredRedirectUri.isBlank()) {
            return defaultRedirectUri;
        }

        // Common misconfiguration: backend callback path instead of frontend callback route.
        if (configuredRedirectUri.endsWith("/api/v1/github/callback")) {
            log.warn("Detected invalid GitHub redirect URI '{}'. Using '{}' instead.", configuredRedirectUri, defaultRedirectUri);
            return defaultRedirectUri;
        }

        // Keep callback on frontend route to match Angular callback component.
        if (!configuredRedirectUri.endsWith("/auth/github/callback")) {
            log.warn("Unsupported GitHub redirect URI '{}'. Using '{}' instead.", configuredRedirectUri, defaultRedirectUri);
            return defaultRedirectUri;
        }

        return configuredRedirectUri;
    }

    private String normalizeUrl(String value, String fallback) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isEmpty()) {
            normalized = fallback;
        }

        if (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        return normalized;
    }
}
