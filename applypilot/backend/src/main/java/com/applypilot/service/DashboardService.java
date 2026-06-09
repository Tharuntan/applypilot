package com.applypilot.service;

import com.applypilot.domain.ApplicationStatus;
import com.applypilot.domain.JobApplication;
import com.applypilot.domain.MatchReport;
import com.applypilot.domain.User;
import com.applypilot.dto.DashboardDtos.*;
import com.applypilot.repository.JobApplicationRepository;
import com.applypilot.repository.MatchReportRepository;
import com.applypilot.security.CurrentUserService;
import com.applypilot.support.JsonLists;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final JobApplicationRepository applicationRepository;
    private final MatchReportRepository matchReportRepository;
    private final CurrentUserService currentUser;

    public DashboardService(JobApplicationRepository applicationRepository,
                            MatchReportRepository matchReportRepository,
                            CurrentUserService currentUser) {
        this.applicationRepository = applicationRepository;
        this.matchReportRepository = matchReportRepository;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public DashboardSummary summary() {
        User user = currentUser.require();

        List<JobApplication> apps = applicationRepository.findByUserOrderByCreatedAtDesc(user);
        List<MatchReport> reports = matchReportRepository.findByUserOrderByCreatedAtDesc(user);

        long total = apps.size();
        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        long thisWeek = apps.stream().filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isAfter(weekAgo)).count();
        long interviews = countStatus(apps, ApplicationStatus.INTERVIEW);
        long offers = countStatus(apps, ApplicationStatus.OFFER);
        long rejections = countStatus(apps, ApplicationStatus.REJECTED);

        LocalDate today = LocalDate.now();
        long followUpsDue = apps.stream()
                .filter(a -> a.getFollowUpDate() != null && !a.getFollowUpDate().isAfter(today))
                .filter(a -> a.getStatus() != ApplicationStatus.REJECTED && a.getStatus() != ApplicationStatus.WITHDRAWN)
                .count();

        double avgScore = reports.stream().mapToInt(MatchReport::getMatchScore).average().orElse(0.0);
        int highestScore = reports.stream().mapToInt(MatchReport::getMatchScore).max().orElse(0);

        List<StatusCount> statusBreakdown = new ArrayList<>();
        for (ApplicationStatus s : ApplicationStatus.values()) {
            statusBreakdown.add(new StatusCount(s.name(), countStatus(apps, s)));
        }

        List<RecentMatch> recentMatches = reports.stream().limit(5)
                .map(r -> new RecentMatch(r.getId(),
                        r.getJobDescription().getCompanyName(),
                        r.getJobDescription().getJobTitle(),
                        r.getMatchScore(),
                        String.valueOf(r.getCreatedAt())))
                .toList();

        List<RecentApplication> recentApps = apps.stream().limit(5)
                .map(a -> new RecentApplication(a.getId(), a.getCompanyName(), a.getJobTitle(),
                        a.getStatus().name(), String.valueOf(a.getCreatedAt())))
                .toList();

        List<SkillCount> topMissing = computeTopMissingSkills(reports);

        return new DashboardSummary(total, thisWeek, interviews, offers, rejections, followUpsDue,
                round1(avgScore), highestScore, statusBreakdown, recentMatches, recentApps, topMissing);
    }

    private List<SkillCount> computeTopMissingSkills(List<MatchReport> reports) {
        Map<String, Long> counts = new HashMap<>();
        for (MatchReport r : reports) {
            for (String skill : JsonLists.fromJson(r.getMissingKeywords())) {
                counts.merge(skill, 1L, Long::sum);
            }
        }
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> new SkillCount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    private long countStatus(List<JobApplication> apps, ApplicationStatus status) {
        return apps.stream().filter(a -> a.getStatus() == status).count();
    }

    private double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
