package com.hackathon.campusportal.scheduler;

import com.hackathon.campusportal.model.Notification;
import com.hackathon.campusportal.model.Posting;
import com.hackathon.campusportal.model.StatusHistory;
import com.hackathon.campusportal.repo.NotificationRepo;
import com.hackathon.campusportal.repo.PostingRepo;
import com.hackathon.campusportal.repo.StatusHistoryRepo;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.List;

/**
 * Every minute, any APPROVED posting whose deadline has passed
 * is automatically flipped to CLOSED (with a notification + history record).
 */
@Component
public class DeadlineScheduler {

    private final PostingRepo postingRepo;
    private final NotificationRepo notificationRepo;
    private final StatusHistoryRepo historyRepo;

    public DeadlineScheduler(PostingRepo p, NotificationRepo n, StatusHistoryRepo h) {
        this.postingRepo = p;
        this.notificationRepo = n;
        this.historyRepo = h;
    }

    @Scheduled(fixedRate = 60000)
    public void closeExpiredPostings() {
        LocalDate today = LocalDate.now();
        List<Posting> approved = postingRepo.findByStatus(Posting.Status.APPROVED);
        for (Posting p : approved) {
            if (p.getDeadline() != null && p.getDeadline().isBefore(today)) {
                p.setStatus(Posting.Status.CLOSED);
                postingRepo.save(p);
                historyRepo.save(StatusHistory.of(p.getId(), "APPROVED", "CLOSED"));
                notificationRepo.save(Notification.of("POSTING_CLOSED",
                    p.getRoleTitle() + " at " + p.getCompanyName()
                    + " passed its deadline and was auto-closed."));
            }
        }
    }
}
