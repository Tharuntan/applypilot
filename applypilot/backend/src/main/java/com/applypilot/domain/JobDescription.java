package com.applypilot.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_descriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescription extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String jobTitle;

    private String jobUrl;

    private String location;

    private String employmentType;

    private String salaryRange;

    @Column(nullable = false, columnDefinition = "text")
    private String descriptionText;
}
