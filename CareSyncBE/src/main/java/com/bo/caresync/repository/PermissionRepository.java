package com.bo.caresync.repository;

import com.bo.caresync.entity.auth.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 6:34 PM,
 **/

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByPermissionCode(String permissionCode);
    List<Permission> findByCategoryAndRecordStatus(String category, String recordStatus);
    List<Permission> findByRecordStatus(String recordStatus);
}
