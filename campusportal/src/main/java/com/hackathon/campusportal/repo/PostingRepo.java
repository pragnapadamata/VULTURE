package com.hackathon.campusportal.repo;

import com.hackathon.campusportal.model.Posting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostingRepo extends JpaRepository<Posting, Long> {
    List<Posting> findByStatus(Posting.Status status);
}