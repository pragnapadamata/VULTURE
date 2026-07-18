package com.hackathon.campusportal.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "posting_id")
    private Posting posting;

    private String studentName;
    private String studentEmail;
    private String rollNumber;
    private LocalDateTime appliedAt = LocalDateTime.now();

    // --- resume attachment ---
    private String resumeFileName;
    private String resumeContentType;

    @JsonIgnore
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] resumeData;

    /** Exposed in JSON so the UI knows whether a resume can be viewed. */
    public boolean isHasResume() {
        return resumeData != null && resumeData.length > 0;
    }
}
