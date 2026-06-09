package com.applypilot.service;

import com.applypilot.config.ApplyPilotProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails. If no SMTP is configured (no JavaMailSender bean),
 * it logs the message/link instead — so the flows work in local dev without email.
 */
@Slf4j
@Service
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final ApplyPilotProperties props;

    public MailService(ObjectProvider<JavaMailSender> mailSenderProvider, ApplyPilotProperties props) {
        this.mailSenderProvider = mailSenderProvider;
        this.props = props;
    }

    public void send(String to, String subject, String body) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn("""
                    ───────────────── EMAIL (dev mode, not actually sent) ─────────────────
                    To: {}
                    Subject: {}
                    {}
                    ───────────────────────────────────────────────────────────────────────""",
                    to, subject, body);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(props.getApp().getMailFrom());
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.info("Sent email '{}' to {}", subject, to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
