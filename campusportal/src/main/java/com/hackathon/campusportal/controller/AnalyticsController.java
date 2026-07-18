package com.hackathon.campusportal.controller;

import com.hackathon.campusportal.model.Application;
import com.hackathon.campusportal.model.Posting;
import com.hackathon.campusportal.repo.ApplicationRepo;
import com.hackathon.campusportal.repo.PostingRepo;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ApplicationRepo appRepo;
    private final PostingRepo postingRepo;

    public AnalyticsController(ApplicationRepo a, PostingRepo p) {
        this.appRepo = a; this.postingRepo = p;
    }

    @GetMapping
    public Map<String, Object> analytics() {
        List<Application> apps = appRepo.findAll();
        List<Posting> postings = postingRepo.findAll();

        Map<String, Long> appsPerCompany = apps.stream()
            .collect(Collectors.groupingBy(
                x -> x.getPosting().getCompanyName(), Collectors.counting()));

        long totalStudentsApplied = apps.stream()
            .map(Application::getStudentEmail).distinct().count();

        // Postings that reached APPROVED at some point:
        // currently APPROVED, plus CLOSED (closed postings were approved before their deadline passed).
        long reachedApproved = postings.stream()
            .filter(p -> p.getStatus() == Posting.Status.APPROVED
                      || p.getStatus() == Posting.Status.CLOSED).count();

        // Placement rate = unique students who applied / postings that reached APPROVED, as %
        double placementRate = reachedApproved == 0 ? 0.0
            : Math.round(totalStudentsApplied * 1000.0 / reachedApproved) / 10.0;

        Map<String, Object> out = new HashMap<>();
        out.put("totalPostings", postings.size());
        out.put("approvedPostings", postings.stream()
            .filter(p -> p.getStatus() == Posting.Status.APPROVED).count());
        out.put("pendingPostings", postings.stream()
            .filter(p -> p.getStatus() == Posting.Status.PENDING).count());
        out.put("rejectedPostings", postings.stream()
            .filter(p -> p.getStatus() == Posting.Status.REJECTED).count());
        out.put("closedPostings", postings.stream()
            .filter(p -> p.getStatus() == Posting.Status.CLOSED).count());
        out.put("totalApplications", apps.size());
        out.put("applicationsPerCompany", appsPerCompany);
        out.put("uniqueApplicants", totalStudentsApplied);
        out.put("postingsReachedApproved", reachedApproved);
        out.put("placementRate", placementRate);

        // applications per day, last 14 days (zero-filled for a smooth chart)
        Map<String, Long> overTime = new LinkedHashMap<>();
        LocalDate start = LocalDate.now().minusDays(13);
        for (int i = 0; i < 14; i++) overTime.put(start.plusDays(i).toString(), 0L);
        for (Application a : apps) {
            if (a.getAppliedAt() != null) {
                String d = a.getAppliedAt().toLocalDate().toString();
                overTime.computeIfPresent(d, (k, v) -> v + 1);
            }
        }
        out.put("applicationsOverTime", overTime);
        out.put("companies", postings.stream().map(Posting::getCompanyName).distinct().count());
        return out;
    }
}
