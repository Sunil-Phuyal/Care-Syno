package com.bo.caresync.config;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/9/2026, 3:48 PM,
 **/

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsConfig implements Filter {

    private static final String ORIGIN = "Origin";
    private static final String VARY = "Vary";
    private static final String ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    // "*" does not cover the Authorization header in browsers, so it is listed by name.
    private static final String ALLOWED_HEADERS = "Authorization, Content-Type, Accept, X-Requested-With";

    private final List<String> allowedOrigins;

    /**
     * Comma separated list of allowed origins, for example:
     * https://caresync.vercel.app,http://localhost:5173
     * A trailing slash is removed. Use "*" only to allow every origin on purpose.
     */
    public CorsConfig(@Value("${app.cors.allowed-origins:http://localhost:5173}") String origins) {
        this.allowedOrigins = Arrays.stream(origins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .map(origin -> origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin)
                .toList();
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        String origin = request.getHeader(ORIGIN);

        if (origin != null) {
            if (allowedOrigins.contains(AppConstants.Cors.ALL)) {
                response.setHeader(AppConstants.Cors.ACCESS_CONTROL_ALLOW_ORIGIN, AppConstants.Cors.ALL);
                addCommonHeaders(response);
            } else if (allowedOrigins.contains(origin)) {
                response.setHeader(AppConstants.Cors.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
                response.addHeader(VARY, ORIGIN);
                addCommonHeaders(response);
            }
        }

        if (AppConstants.Cors.OPTIONS_METHOD.equalsIgnoreCase(request.getMethod())) {
            System.out.println(MessageConstants.Cors.PRE_FLIGHT_MSG);
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }

    private void addCommonHeaders(HttpServletResponse response) {
        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_ALLOW_METHODS, ALLOWED_METHODS);
        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_ALLOW_HEADERS, ALLOWED_HEADERS);
        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_MAX_AGE, AppConstants.Cors.MAX_AGE_24_HOURS);
        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_EXPOSE_HEADERS, AppConstants.Cors.ALL);
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
}