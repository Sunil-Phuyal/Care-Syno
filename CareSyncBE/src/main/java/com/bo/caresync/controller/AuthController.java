package com.bo.caresync.controller;


import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.request.RegisterRequest;
import com.bo.caresync.dto.request.auth.LoginRequest;
import com.bo.caresync.dto.response.LoginResponse;
import com.bo.caresync.dto.response.UserResponse;
import com.bo.caresync.service.AuthService;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 6:22 PM,
 **/
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController extends BaseController {

    private final AuthService authService;
    private final LoginUserUtil loginUserUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return successResponse(
                MessageConstants.Auth.REGISTRATION_SUCCESS, null);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return successResponse(
                MessageConstants.Auth.LOGIN_SUCCESS,
                response
        );
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Long userId = loginUserUtil.getCurrentUserId();
        UserResponse response = authService.getCurrentUser(userId);
        return successResponse(
                "User details retrieved successfully",
                response
        );
    }
}