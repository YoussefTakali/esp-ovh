package tn.esprithub.server.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@Slf4j
public class ApiPrefixNormalizationFilter extends OncePerRequestFilter {

    private static final String API_PREFIX = "/api";

    // Handles proxies that accidentally strip "/api" before forwarding to backend.
    private static final List<String> STRIPPED_API_ROOTS = List.of(
            "/v1", "/student", "/teacher", "/projects", "/groups", "/tasks",
            "/repositories", "/ai", "/notifications", "/github", "/debug"
    );

    private static final List<String> EXCLUDED_ROOTS = List.of(
            "/api", "/ws", "/swagger-ui", "/v3", "/actuator", "/error"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestUri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String path = stripContextPath(requestUri, contextPath);

        if (shouldNormalize(path)) {
            String rewrittenPath = API_PREFIX + path;
            HttpServletRequest wrappedRequest = new ApiPathRequestWrapper(request, rewrittenPath);
            log.debug("Normalized request path from {} to {}", path, rewrittenPath);
            filterChain.doFilter(wrappedRequest, response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldNormalize(String path) {
        if (path == null || path.isBlank()) {
            return false;
        }

        boolean excluded = EXCLUDED_ROOTS.stream().anyMatch(root -> path.equals(root) || path.startsWith(root + "/"));
        if (excluded) {
            return false;
        }

        return STRIPPED_API_ROOTS.stream().anyMatch(root -> path.equals(root) || path.startsWith(root + "/"));
    }

    private String stripContextPath(String requestUri, String contextPath) {
        if (requestUri == null) {
            return "";
        }

        if (contextPath != null && !contextPath.isBlank() && requestUri.startsWith(contextPath)) {
            return requestUri.substring(contextPath.length());
        }

        return requestUri;
    }

    private static final class ApiPathRequestWrapper extends HttpServletRequestWrapper {

        private final String rewrittenServletPath;
        private final String rewrittenRequestUri;

        private ApiPathRequestWrapper(HttpServletRequest request, String rewrittenServletPath) {
            super(request);
            String contextPath = request.getContextPath();
            this.rewrittenServletPath = rewrittenServletPath;
            this.rewrittenRequestUri = (contextPath == null ? "" : contextPath) + rewrittenServletPath;
        }

        @Override
        public String getServletPath() {
            return rewrittenServletPath;
        }

        @Override
        public String getRequestURI() {
            return rewrittenRequestUri;
        }

        @Override
        public StringBuffer getRequestURL() {
            HttpServletRequest request = (HttpServletRequest) getRequest();
            StringBuffer url = new StringBuffer();
            url.append(request.getScheme()).append("://").append(request.getServerName());

            int port = request.getServerPort();
            boolean appendPort = ("http".equalsIgnoreCase(request.getScheme()) && port != 80)
                    || ("https".equalsIgnoreCase(request.getScheme()) && port != 443);
            if (appendPort) {
                url.append(':').append(port);
            }

            url.append(rewrittenRequestUri);
            return url;
        }
    }
}
