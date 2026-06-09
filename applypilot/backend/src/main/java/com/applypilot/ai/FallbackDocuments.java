package com.applypilot.ai;

/**
 * Deterministic document templates used when the AI provider is unavailable.
 * Keeps the document generator useful without an API key.
 */
public final class FallbackDocuments {

    private FallbackDocuments() {
    }

    private static String co(String s) {
        return (s == null || s.isBlank()) ? "the company" : s.trim();
    }

    private static String role(String s) {
        return (s == null || s.isBlank()) ? "the role" : s.trim();
    }

    public static String coverLetter(String companyName, String jobTitle) {
        return """
                Dear Hiring Manager,

                I am excited to apply for the %s position at %s. With a strong background in software
                engineering and hands-on experience delivering production-grade applications, I am confident
                I can contribute meaningfully to your team from day one.

                Throughout my career I have designed, built, and shipped features end-to-end, collaborating
                closely with product and QA in Agile teams. I focus on writing clean, well-tested code and on
                continuously learning the tools and practices that help teams ship faster and more reliably.

                I would welcome the opportunity to discuss how my experience aligns with your needs. Thank you
                for considering my application.

                Sincerely,
                [Your Name]
                """.formatted(role(jobTitle), co(companyName));
    }

    public static String recruiterMessage(String companyName, String jobTitle) {
        return """
                Hi [Recruiter Name],

                I came across the %s opening at %s and it's a great match for my background in software
                engineering. I'd love to learn more about the team and share how my experience could add value.
                Would you be open to a quick chat this week?

                Thanks!
                [Your Name]
                """.formatted(role(jobTitle), co(companyName));
    }

    public static String followUpEmail(String companyName, String jobTitle) {
        return """
                Subject: Following up on my %s application

                Hi [Recruiter Name],

                I hope you're doing well. I wanted to follow up on my application for the %s role at %s.
                I remain very interested in the opportunity and would be happy to provide any additional
                information you may need. Is there an update on the timeline or next steps?

                Thank you for your time.

                Best regards,
                [Your Name]
                """.formatted(role(jobTitle), role(jobTitle), co(companyName));
    }

    public static String thankYouEmail(String companyName, String jobTitle) {
        return """
                Subject: Thank you for the interview

                Hi [Interviewer Name],

                Thank you for taking the time to speak with me about the %s role at %s. I enjoyed our
                conversation and learning more about the team's goals. Our discussion reinforced my
                enthusiasm for the position, and I'm confident my skills would let me contribute quickly.

                Please don't hesitate to reach out if you need anything further from me.

                Best regards,
                [Your Name]
                """.formatted(role(jobTitle), co(companyName));
    }

    public static String coldEmail(String companyName, String jobTitle) {
        return """
                Subject: Interested in the %s role at %s

                Hi [Recruiter Name],

                My name is [Your Name] and I'm a software engineer interested in the %s position at %s.
                I have a track record of shipping reliable, well-tested software and would love to be
                considered. I've attached my resume and would welcome a brief conversation.

                Thank you for your time.

                Best,
                [Your Name]
                """.formatted(role(jobTitle), co(companyName), role(jobTitle), co(companyName));
    }
}
