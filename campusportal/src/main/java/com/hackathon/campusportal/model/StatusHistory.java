package com.hackathon.campusportal.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/** Audit record of a posting status transition. */
@Data
@Entity
@Table(name = "status_history")
public class StatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "posting_id")
    private Long postingId;

    /** null when the posting was first created */
    private String fromStatus;
    private String toStatus;
    private LocalDateTime changedAt = LocalDateTime.now();

    /** optional admin comment attached to this transition */
    @Column(length = 500)
    private String comment;

    public static StatusHistory of(Long postingId, String from, String to) {
        StatusHistory h = new StatusHistory();
        h.setPostingId(postingId);
        h.setFromStatus(from);
        h.setToStatus(to);
        return h;
    }
}
