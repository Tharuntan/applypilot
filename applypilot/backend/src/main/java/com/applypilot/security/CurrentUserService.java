package com.applypilot.security;

import com.applypilot.domain.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

/**
 * Resolves the {@link User} entity behind the current security context.
 */
@Service
public class CurrentUserService {

    public User require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AppUserDetails details)) {
            throw new ResponseStatusException(UNAUTHORIZED, "Not authenticated");
        }
        return details.getUser();
    }
}
