package com.hackathon.campusportal.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
public class Posting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String roleTitle;
    @Column(length = 2000)
    private String description;
    private String eligibility;
    private LocalDate deadline;

    /** optional, e.g. "₹ 12 LPA" or "₹ 40k/month stipend" */
    private String salary;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum Status { PENDING, APPROVED, REJECTED, CLOSED }
}
