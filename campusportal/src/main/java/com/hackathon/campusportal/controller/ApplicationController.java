package com.hackathon.campusportal.controller;

import com.hackathon.campusportal.model.Application;
import com.hackathon.campusportal.model.Notification;
import com.hackathon.campusportal.model.Posting;
import com.hackathon.campusportal.repo.ApplicationRepo;
import com.hackathon.campusportal.repo.NotificationRepo;
import com.hackathon.campusportal.repo.PostingRepo;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private static final Set<String> ALLOWED_RESUME_TYPES = Set.of(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private final ApplicationRepo appRepo;
    private final PostingRepo postingRepo;
    private final NotificationRepo notificationRepo;

    public ApplicationController(ApplicationRepo a, PostingRepo p, NotificationRepo n) {
        this.appRepo = a; this.postingRepo = p; this.notificationRepo = n;
    }

    // STUDENT: apply (only to APPROVED postings, no duplicates) — legacy JSON endpoint
    @PostMapping
    public Application apply(@RequestBody Application a) {
        Posting posting = validate(a.getPosting().getId(), a.getStudentEmail());
        a.setId(null);
        a.setPosting(posting);
        Application saved = appRepo.save(a);
        notifyApplied(saved);
        return saved;
    }

    // STUDENT: apply with resume (multipart) — the primary application flow
    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Application applyWithResume(@RequestParam Long postingId,
                                       @RequestParam String studentName,
                                       @RequestParam String studentEmail,
                                       @RequestParam String rollNumber,
                                       @RequestParam("resume") MultipartFile resume) {
        Posting posting = validate(postingId, studentEmail);

        if (resume == null || resume.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A resume file is required");
        String name = resume.getOriginalFilename() == null ? "" : resume.getOriginalFilename().toLowerCase();
        boolean okExt = name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx");
        boolean okType = resume.getContentType() != null && ALLOWED_RESUME_TYPES.contains(resume.getContentType());
        if (!okExt && !okType)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume must be a PDF or Word document");

        Application a = new Application();
        a.setPosting(posting);
        a.setStudentName(studentName);
        a.setStudentEmail(studentEmail);
        a.setRollNumber(rollNumber);
        a.setResumeFileName(resume.getOriginalFilename());
        a.setResumeContentType(resume.getContentType() != null ? resume.getContentType() : "application/octet-stream");
        try {
            a.setResumeData(resume.getBytes());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read resume file");
        }
        Application saved = appRepo.save(a);
        notifyApplied(saved);
        return saved;
    }

    // ADMIN: view/download an applicant's resume
    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> resume(@PathVariable Long id) {
        Application a = appRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if (a.getResumeData() == null || a.getResumeData().length == 0)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No resume attached to this application");
        String fileName = a.getResumeFileName() != null ? a.getResumeFileName() : "resume.pdf";
        String type = a.getResumeContentType() != null ? a.getResumeContentType() : "application/pdf";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
            .header(HttpHeaders.CONTENT_TYPE, type)
            .body(a.getResumeData());
    }

    @GetMapping
    public List<Application> all() { return appRepo.findAll(); }

    @GetMapping("/posting/{postingId}")
    public List<Application> byPosting(@PathVariable Long postingId) {
        return appRepo.findByPostingId(postingId);
    }

    private Posting validate(Long postingId, String studentEmail) {
        Posting posting = postingRepo.findById(postingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Posting not found"));
        if (posting.getStatus() != Posting.Status.APPROVED)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Posting is not open for applications");
        if (appRepo.existsByPostingIdAndStudentEmail(posting.getId(), studentEmail))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already applied");
        return posting;
    }

    private void notifyApplied(Application a) {
        notificationRepo.save(Notification.of("NEW_APPLICATION",
            a.getStudentName() + " applied to " + a.getPosting().getRoleTitle()
            + " at " + a.getPosting().getCompanyName() + "."));
    }
}
