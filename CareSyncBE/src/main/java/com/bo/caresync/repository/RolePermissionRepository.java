package com.bo.caresync.repository;

import com.bo.caresync.entity.auth.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 6:26 PM,
 **/
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findByRoleIdAndRecordStatus(Long roleId, String recordStatus);

    List<RolePermission> findByRoleIdAndIsGrantedAndRecordStatus(
            Long roleId, Boolean isGranted, String recordStatus
    );
}