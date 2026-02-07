package com.bo.caresync.service.email;

import com.bo.caresync.dto.request.email.EmailRequest;
import com.bo.caresync.utils.AppUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/7/2026, 1:43 PM,
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${email.from}")
    private String fromEmail;

    @Value("${email.from.name}")
    private String fromName;

    /**
     * Send simple text email asynchronously
     */
    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        String methodName = AppUtil.getMethodName();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("{} Email sent successfully to: {}", methodName, to);

        } catch (Exception e) {
            log.error("{} Failed to send email to {}: {}", methodName, to, e.getMessage(), e);
        }
    }

    /**
     * Send HTML email asynchronously
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        String methodName = AppUtil.getMethodName();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);

            log.info("{} HTML email sent successfully to: {}", methodName, to);

        } catch (MessagingException e) {
            log.error("{} Failed to send HTML email to {}: {}", methodName, to, e.getMessage(), e);
        } catch (Exception e) {
            log.error("{} Unexpected error sending email to {}: {}", methodName, to, e.getMessage(), e);
        }
    }

    /**
     * Send email using EmailRequest DTO
     */
    @Async
    public void sendEmail(EmailRequest request) {
        if (request.isHtml()) {
            sendHtmlEmail(request.getTo(), request.getSubject(), request.getBody());
        } else {
            sendSimpleEmail(request.getTo(), request.getSubject(), request.getBody());
        }
    }

    /**
     * Send email to multiple recipients
     */
    @Async
    public void sendBulkEmail(String[] recipients, String subject, String body) {
        String methodName = AppUtil.getMethodName();

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipients);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("{} Bulk email sent to {} recipients", methodName, recipients.length);

        } catch (Exception e) {
            log.error("{} Failed to send bulk email: {}", methodName, e.getMessage(), e);
        }
    }
}