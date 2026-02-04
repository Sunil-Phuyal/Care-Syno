package com.bo.caresync.utils;

import com.bo.caresync.entity.user.User;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;


/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 6:18 PM,
 **/
@Slf4j
@Component
@RequiredArgsConstructor
public class LoginUserUtil {
    private UserRepository userRepository;

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BaseException(ErrorCode.UNAUTHORIZED, "No authenticated user");
        }

        String userIdStr = authentication.getName();
        return Long.parseLong(userIdStr);
    }
    public User getCurrentUser() {
        Long userId = getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
    }

    public String getCurrentUserEmail() {
        User user = getCurrentUser();
        return user.getEmail();
    }
}
