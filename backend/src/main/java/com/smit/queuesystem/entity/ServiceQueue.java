package com.smit.queuesystem.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "service_queues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branch", "department"})
public class ServiceQueue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String prefix; // e.g., 'A' for tokens A001, A002
    private String serviceCode;
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer averageServiceTimeMinutes = 5;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Integer currentServingToken = 0;

    @Builder.Default
    private Integer lastGeneratedToken = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Builder.Default
    private Integer currentTokenSequence = 0;
}
