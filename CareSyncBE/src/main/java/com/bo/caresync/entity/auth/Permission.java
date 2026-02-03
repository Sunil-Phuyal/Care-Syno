package com.bo.caresync.entity.auth;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 3:59 PM,
 **/
@Getter
@Setter
@Entity
@Table(name = "permissions", schema = "caresync")
public class Permission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    private Long permissionId;

    @Column(name = "permission_code")
    private String permissionCode;

    @Column(name = "permission_name")
    private String permissionName;

    @Column(name = "description")
    private String description;

    @Column(name = "category")
    private String category;
}