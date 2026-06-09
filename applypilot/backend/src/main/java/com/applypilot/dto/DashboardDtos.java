package com.applypilot.dto;

import java.util.List;

public final class DashboardDtos {

    private DashboardDtos() {
    }

    public record DashboardSummary(
            long totalApplications,
            long applicationsThisWeek,
            long interviews,
            long offers,
            long rejections,
            long followUpsDue,
            double averageMatchScore,
            int highestMatchScore,
            List<StatusCount> statusBreakdown,
            List<RecentMatch> recentMatchReports,
            List<RecentApplication> recentApplications,
            List<SkillCount> topMissingSkills
    ) {
    }

    public record StatusCount(String status, long count) {
    }

    public record SkillCount(String skill, long count) {
    }

    public record RecentMatch(
            Long id,
            String companyName,
            String jobTitle,
            int matchScore,
            String createdAt
    ) {
    }

    public record RecentApplication(
            Long id,
            String companyName,
            String jobTitle,
            String status,
            String createdAt
    ) {
    }
}
