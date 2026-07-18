package com.hackathon.campusportal.repo;

import com.hackathon.campusportal.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepo extends JpaRepository<Application, Long> {
    List<Application> findByPostingId(Long postingId);
    boolean existsByPostingIdAndStudentEmail(Long postingId, String studentEmail);
}