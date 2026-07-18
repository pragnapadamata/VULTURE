package com.hackathon.campusportal.controller;

import com.hackathon.campusportal.model.Notification;
import com.hackathon.campusportal.repo.NotificationRepo;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepo repo;
    public NotificationController(NotificationRepo repo) { this.repo = repo; }

    @GetMapping
    public List<Notification> all() { return repo.findAllByOrderByCreatedAtDesc(); }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("unread", repo.countByReadFalse());
    }

    @PutMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id) {
        Notification n = repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        n.setRead(true);
        return repo.save(n);
    }

    @PutMapping("/read-all")
    public List<Notification> markAllRead() {
        List<Notification> all = repo.findAll();
        all.forEach(n -> n.setRead(true));
        return repo.saveAll(all);
    }
}
