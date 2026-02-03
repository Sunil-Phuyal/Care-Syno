package com.bo.caresync.entity.auth;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 11:09 AM,
 **/

@Getter
@Setter
@Entity
@Table(name = "roles", schema = "auth")
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "role_name")
    private String roleName;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "description")
    private String description;
}