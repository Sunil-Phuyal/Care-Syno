package com.bo.caresync.repository;

import com.bo.caresync.entity.auth.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 6:21 PM,
 **/

public interface RoleRepository extends JpaRepository<Role,Long> {
    Optional<Role> findByRoleName(String roleName);
    Optional<Role> findByRoleNameAndRecordStatus(String roleName, String recordStatus);
}
