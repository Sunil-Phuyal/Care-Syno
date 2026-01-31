package com.bo.caresync.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/31/2026, 6:32 PM,
 **/
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@JsonDeserialize
@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class BaseEntity {
    @CreatedBy
    @Column(name = "created_by")
    @JsonProperty("created_by")
    private String createdBy;
    @CreatedDate
    @Column(name = "created_at")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @LastModifiedBy
    @Column(name = "modified_by")
    @JsonProperty("modified_by")
    private String modifiedBy;
    @LastModifiedDate
    @Column(name = "modified_at")
    @JsonProperty("modified_at")
    private LocalDateTime modifiedAt;
    @Column(name = "record_status")
    @JsonProperty("record_status")
    private String recordStatus = "Y";
}
