package com.hackathon.campusportal.repo;

import com.hackathon.campusportal.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StatusHistoryRepo extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByPostingIdOrderByChangedAtAsc(Long postingId);
}
