package com.bo.caresync.repository;

import com.bo.caresync.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 6:47 PM,
 **/

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndRecordStatus(String email, String recordStatus);

    Boolean existsByEmail(String email);
}