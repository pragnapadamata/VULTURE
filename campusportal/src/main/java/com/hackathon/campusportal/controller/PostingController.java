
package com.hackathon.campusportal.controller;

import com.hackathon.campusportal.model.Notification;
import com.hackathon.campusportal.model.Posting;
import com.hackathon.campusportal.model.StatusHistory;
import com.hackathon.campusportal.repo.NotificationRepo;
import com.hackathon.campusportal.repo.PostingRepo;
import com.hackathon.campusportal.repo.StatusHistoryRepo;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/postings")
public class PostingController {

    private final PostingRepo repo;
    private final NotificationRepo notificationRepo;
    private final StatusHistoryRepo historyRepo;

    public PostingController(PostingRepo repo, NotificationRepo notificationRepo,
                             StatusHistoryRepo historyRepo) {
        this.repo = repo;
        this.notificationRepo = notificationRepo;
        this.historyRepo = historyRepo;
    }

    // COMPANY: create posting -> always starts PENDING
    @PostMapping
    public Posting create(@RequestBody Posting p) {
        p.setId(null);
        p.setStatus(Posting.Status.PENDING);
        Posting saved = repo.save(p);
        historyRepo.save(StatusHistory.of(saved.getId(), null, "PENDING"));
        return saved;
    }

    // STUDENT: only approved postings, filtered in DB, not in UI
    @GetMapping("/approved")
    public List<Posting> approved() {
        return repo.findByStatus(Posting.Status.APPROVED);
    }

    // ADMIN: pending queue
    @GetMapping("/pending")
    public List<Posting> pending() {
        return repo.findByStatus(Posting.Status.PENDING);
    }

    // ADMIN: everything
    @GetMapping
    public List<Posting> all() { return repo.findAll(); }

    // Audit-style status timeline for one posting
    @GetMapping("/{id}/history")
    public List<StatusHistory> history(@PathVariable Long id) {
        return historyRepo.findByPostingIdOrderByChangedAtAsc(id);
    }

    // ADMIN: approve / reject / close
    @PutMapping("/{id}/status")
    public Posting setStatus(@PathVariable Long id, @RequestParam String value,
                             @RequestParam(required = false) String comment) {
        Posting p = repo.findById(id).orElseThrow();
        Posting.Status oldStatus = p.getStatus();
        Posting.Status newStatus = Posting.Status.valueOf(value.toUpperCase());
        p.setStatus(newStatus);
        Posting saved = repo.save(p);
        if (oldStatus != newStatus) {
            StatusHistory h = StatusHistory.of(saved.getId(),
                oldStatus == null ? null : oldStatus.name(), newStatus.name());
            if (comment != null && !comment.isBlank()) h.setComment(comment.trim());
            historyRepo.save(h);
        }
        if (newStatus == Posting.Status.APPROVED) {
            notificationRepo.save(Notification.of("POSTING_APPROVED",
                p.getRoleTitle() + " at " + p.getCompanyName() + " was approved and is now live for students."));
        } else if (newStatus == Posting.Status.REJECTED) {
            notificationRepo.save(Notification.of("POSTING_REJECTED",
                p.getRoleTitle() + " at " + p.getCompanyName() + " was rejected."));
        } else if (newStatus == Posting.Status.CLOSED) {
            notificationRepo.save(Notification.of("POSTING_CLOSED",
                p.getRoleTitle() + " at " + p.getCompanyName() + " was closed."));
        }
        return saved;
    }
}
