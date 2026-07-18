package com.hackathon.campusportal.repo;

import com.hackathon.campusportal.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    long countByReadFalse();
}
