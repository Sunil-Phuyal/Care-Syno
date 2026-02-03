package com.bo.caresync.entity.auth;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 11:19 AM,
 **/

@Getter
@Setter
@Entity
@Table(name = "role_permissions", schema = "auth")
public class RolePermission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_permission_id")
    private Long rolePermissionId;

    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "permission_id")
    private Long permissionId;

    @Column(name = "is_granted")
    private Boolean isGranted;
}