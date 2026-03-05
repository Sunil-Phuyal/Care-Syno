package com.bo.caresync.config;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/9/2026, 3:48 PM,
 **/

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsConfig implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_ALLOW_ORIGIN, AppConstants.Cors.ALL);
        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_ALLOW_METHODS, AppConstants.Cors.ALL);
        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_ALLOW_HEADERS, AppConstants.Cors.ALL);
        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_MAX_AGE, AppConstants.Cors.MAX_AGE_24_HOURS);
        response.setHeader(AppConstants.Cors.ACCESS_CONTROL_EXPOSE_HEADERS, AppConstants.Cors.ALL);

        if (AppConstants.Cors.OPTIONS_METHOD.equalsIgnoreCase(request.getMethod())) {
            System.out.println(MessageConstants.Cors.PRE_FLIGHT_MSG);
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
}