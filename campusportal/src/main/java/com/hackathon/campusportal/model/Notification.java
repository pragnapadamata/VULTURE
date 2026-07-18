package com.hackathon.campusportal.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String message;

    /** POSTING_APPROVED, POSTING_REJECTED, POSTING_CLOSED, NEW_APPLICATION */
    private String type;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_read")
    private boolean read = false;

    public static Notification of(String type, String message) {
        Notification n = new Notification();
        n.setType(type);
        n.setMessage(message);
        return n;
    }
}
