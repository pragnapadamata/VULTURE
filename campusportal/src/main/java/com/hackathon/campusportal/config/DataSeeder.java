package com.hackathon.campusportal.config;

import com.hackathon.campusportal.model.Application;
import com.hackathon.campusportal.model.Notification;
import com.hackathon.campusportal.model.Posting;
import com.hackathon.campusportal.model.StatusHistory;
import com.hackathon.campusportal.repo.ApplicationRepo;
import com.hackathon.campusportal.repo.NotificationRepo;
import com.hackathon.campusportal.repo.PostingRepo;
import com.hackathon.campusportal.repo.StatusHistoryRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds realistic demo data on first startup only (skipped if postings exist).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final PostingRepo postings;
    private final ApplicationRepo applications;
    private final NotificationRepo notifications;
    private final StatusHistoryRepo history;

    public DataSeeder(PostingRepo p, ApplicationRepo a, NotificationRepo n, StatusHistoryRepo h) {
        this.postings = p; this.applications = a; this.notifications = n; this.history = h;
    }

    @Override
    public void run(String... args) {
        if (postings.count() > 0) return; // don't duplicate on restart

        LocalDate today = LocalDate.now();

        Posting google   = posting("Google", "Software Engineer",
            "Build scalable products that impact millions of users. Modern stack, strong mentorship, real ownership.",
            "B.Tech/M.Tech in CS/IT or related, no active backlogs, 2025 passouts", today.plusDays(14), Posting.Status.APPROVED);
        Posting zomato   = posting("Zomato", "UI/UX Designer",
            "Design delightful ordering experiences used by millions daily. Figma-first team, rapid ship cycles.",
            "Any branch, strong portfolio, CGPA >= 6.5", today.plusDays(7), Posting.Status.APPROVED);
        Posting flipkart = posting("Flipkart", "Backend Developer",
            "High-scale Java services powering India's biggest sale events. Correctness and testing matter here.",
            "CSE/IT, DSA proficiency, CGPA >= 7.0", today.plusDays(21), Posting.Status.APPROVED);
        Posting amazon   = posting("Amazon", "Data Scientist",
            "Own forecasting models for fulfillment. SQL + Python heavy, business-facing role.",
            "CSE/AI-DS/Stats, PyTorch or sklearn, CGPA >= 7.5", today.minusDays(1), Posting.Status.APPROVED); // auto-close demo
        Posting microsoft= posting("Microsoft", "Frontend Developer",
            "TypeScript + modern frameworks on a product used by every Fortune 500. Accessibility-first.",
            "CSE/IT, strong JS fundamentals, CGPA >= 7.0", today.plusDays(10), Posting.Status.PENDING);
        Posting tcs      = posting("TCS", "Systems Engineer",
            "Enterprise delivery across cloud and data platforms. Structured training program included.",
            "Any branch, CGPA >= 6.0", today.plusDays(12), Posting.Status.PENDING);
        posting("Infosys", "Digital Specialist Engineer",
            "Full-stack delivery pods for global clients. Java/Spring + Angular.",
            "CSE/IT/ECE, CGPA >= 6.5", today.plusDays(9), Posting.Status.REJECTED);
        Posting ibm = posting("IBM", "Cloud Engineer Intern",
            "Kubernetes and hybrid-cloud tooling on real client workloads.",
            "CSE/IT, Linux basics, CGPA >= 7.0", today.minusDays(3), Posting.Status.CLOSED);

        apply(google,   "Aarav Sharma",  "aarav.sharma@campus.edu",  "21CS101");
        apply(google,   "Diya Patel",    "diya.patel@campus.edu",    "21CS114");
        apply(google,   "Rohan Verma",   "rohan.verma@campus.edu",   "21IT042");
        apply(zomato,   "Ananya Iyer",   "ananya.iyer@campus.edu",   "21EC077");
        apply(zomato,   "Diya Patel",    "diya.patel@campus.edu",    "21CS114");
        apply(flipkart, "Rohan Verma",   "rohan.verma@campus.edu",   "21IT042");
        apply(flipkart, "Aarav Sharma",  "aarav.sharma@campus.edu",  "21CS101");
        apply(amazon,   "Ananya Iyer",   "ananya.iyer@campus.edu",   "21EC077");
        apply(ibm,      "Diya Patel",    "diya.patel@campus.edu",    "21CS114");

        notifications.save(Notification.of("POSTING_APPROVED",
            "Software Engineer at Google was approved and is now live for students."));
        notifications.save(Notification.of("POSTING_REJECTED",
            "Digital Specialist Engineer at Infosys was rejected."));
        notifications.save(Notification.of("NEW_APPLICATION",
            "Aarav Sharma applied to Software Engineer at Google."));
        notifications.save(Notification.of("POSTING_CLOSED",
            "Cloud Engineer Intern at IBM passed its deadline and was auto-closed."));
    }

    private Posting posting(String company, String role, String desc, String elig,
                            LocalDate deadline, Posting.Status status) {
        Posting p = new Posting();
        p.setCompanyName(company);
        p.setRoleTitle(role);
        p.setDescription(desc);
        p.setEligibility(elig);
        p.setDeadline(deadline);
        p.setSalary(salaryFor(company));
        p.setStatus(status);
        Posting saved = postings.save(p);
        // audit trail: created as PENDING, then moved to its current state
        StatusHistory created = StatusHistory.of(saved.getId(), null, "PENDING");
        created.setChangedAt(LocalDateTime.now().minusDays(3));
        history.save(created);
        if (status != Posting.Status.PENDING) {
            String via = status == Posting.Status.CLOSED ? "APPROVED" : "PENDING";
            if (status == Posting.Status.CLOSED) {
                StatusHistory approvedStep = StatusHistory.of(saved.getId(), "PENDING", "APPROVED");
                approvedStep.setChangedAt(LocalDateTime.now().minusDays(2));
                history.save(approvedStep);
            }
            StatusHistory current = StatusHistory.of(saved.getId(), via, status.name());
            current.setChangedAt(LocalDateTime.now().minusDays(1));
            history.save(current);
        }
        return saved;
    }

    private String salaryFor(String company) {
        switch (company) {
            case "Google": return "\u20B9 12 - 18 LPA";
            case "Microsoft": return "\u20B9 10 - 16 LPA";
            case "Amazon": return "\u20B9 8 - 12 LPA";
            case "Flipkart": return "\u20B9 10 - 15 LPA";
            case "Zomato": return "\u20B9 8 - 12 LPA";
            case "TCS": return "\u20B9 3.6 - 7 LPA";
            case "Infosys": return "\u20B9 4 - 8 LPA";
            case "IBM": return "\u20B9 40k/month stipend";
            default: return "\u20B9 6 LPA";
        }
    }

    private void apply(Posting p, String name, String email, String roll) {
        Application a = new Application();
        a.setPosting(p);
        a.setStudentName(name);
        a.setStudentEmail(email);
        a.setRollNumber(roll);
        a.setAppliedAt(LocalDateTime.now().minusDays((long) (Math.random() * 13)).minusHours((long) (Math.random() * 20)));
        a.setResumeFileName(name.toLowerCase().replace(" ", "_") + "_resume.pdf");
        a.setResumeContentType("application/pdf");
        a.setResumeData(buildResumePdf(name, roll));
        applications.save(a);
    }

    /** Builds a tiny valid PDF so "View Resume" works on seeded data. */
    private byte[] buildResumePdf(String name, String roll) {
        String content = "BT /F1 20 Tf 72 720 Td (" + name + ") Tj ET\n"
            + "BT /F1 12 Tf 72 695 Td (Roll: " + roll + ") Tj ET\n"
            + "BT /F1 12 Tf 72 675 Td (B.Tech Computer Science, Class of 2027) Tj ET\n"
            + "BT /F1 12 Tf 72 655 Td (Demo resume seeded by TalentBridge) Tj ET";
        byte[] stream = content.getBytes(StandardCharsets.US_ASCII);
        StringBuilder pdf = new StringBuilder();
        List<Integer> offsets = new ArrayList<>();
        pdf.append("%PDF-1.4\n");
        offsets.add(pdf.length());
        pdf.append("1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n");
        offsets.add(pdf.length());
        pdf.append("2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n");
        offsets.add(pdf.length());
        pdf.append("3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]"
            + "/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n");
        offsets.add(pdf.length());
        pdf.append("4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n");
        offsets.add(pdf.length());
        pdf.append("5 0 obj<</Length ").append(stream.length).append(">>stream\n")
           .append(content).append("\nendstream\nendobj\n");
        int xref = pdf.length();
        pdf.append("xref\n0 6\n0000000000 65535 f \n");
        for (int off : offsets) pdf.append(String.format("%010d 00000 n \n", off));
        pdf.append("trailer<</Size 6/Root 1 0 R>>\nstartxref\n").append(xref).append("\n%%EOF");
        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }
}
