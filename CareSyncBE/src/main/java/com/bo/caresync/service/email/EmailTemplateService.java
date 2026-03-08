package com.bo.caresync.service.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/7/2026, 12:16 PM,
 **/
@Service
public class EmailTemplateService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public String getWelcomeEmailBody(String fullName, String email) {
        return String.format("""
            Dear %s,
            
            Welcome to CareSync!
            
            Your account has been created successfully. You can now manage medications and coordinate care for your loved ones.
            
            Your login credentials:
            Email: %s
            
            Get started: %s/login
            
            If you have any questions, feel free to contact our support team.
            
            Best regards,
            The CareSync Team
            """, fullName, email, frontendUrl);
    }

    public String getCaregiverInvitationBody(String inviterName, String patientName,
                                             String email, String tempPassword, String role) {
        return String.format("""
            Hello,
            
            %s has invited you to join the care team for %s on CareSync.
            
            You've been assigned the role: %s
            
            Your temporary login credentials:
            Email: %s
            Password: %s
            
            Please login and change your password immediately: %s/login
            
            About CareSync:
            CareSync helps families coordinate medication management for elderly care. You can now:
            - View medication schedules
            - Log medication administration
            - Track adherence
            - Coordinate with other caregivers
            
            Best regards,
            The CareSync Team
            """, inviterName, patientName, role, email, tempPassword, frontendUrl);
    }

    public String getMedicationLoggedBody(String caregiverName, String patientName,
                                          String medicationName, String dosage, String time) {
        return String.format("""
            Medication Administration Alert
            
            %s has logged a medication for %s:
            
            Medication: %s
            Dosage: %s
            Time: %s
            
            View full details: %s/patients
            
            This is an automated notification from CareSync.
            
            Best regards,
            The CareSync Team
            """, caregiverName, patientName, medicationName, dosage, time, frontendUrl);
    }

    public String getPermissionGrantedBody(String granterName, String patientName,
                                           String permissionName, String expiresAt) {
        String expiryText = expiresAt != null
                ? String.format("This permission expires on: %s", expiresAt)
                : "This permission is permanent.";

        return String.format("""
            Permission Update
            
            %s has granted you a new permission for %s:
            
            Permission: %s
            %s
            
            You can now perform this action. View details: %s/patients
            
            Best regards,
            The CareSync Team
            """, granterName, patientName, permissionName, expiryText, frontendUrl);
    }

    public String getDuplicateDoseWarningBody(String caregiverName, String patientName,
                                              String medicationName, String previousTime,
                                              String previousCaregiver) {
        return String.format("""
            ⚠️ DUPLICATE DOSE WARNING ⚠️
            
            Potential duplicate medication administration detected!
            
            Patient: %s
            Medication: %s
            
            Recent administration:
            - Given by: %s
            - Time: %s
            
            Current attempt:
            - Attempting to administer: %s
            - Time: Just now
            
            Please verify before administering to avoid double-dosing.
            
            View medication history: %s/patients
            
            This is an automated safety alert from CareSync.
            
            Best regards,
            The CareSync Team
            """, patientName, medicationName, previousCaregiver, previousTime,
                caregiverName, frontendUrl);
    }

    public String getMedicationReminderBody(String caregiverName, String patientName,
                                            String medicationName, String dosage,
                                            String scheduledTime) {
        return String.format("""
            Medication Reminder
            
            Hello %s,
            
            This is a reminder for %s's upcoming medication:
            
            Medication: %s
            Dosage: %s
            Scheduled Time: %s
            
            Log administration: %s/medications/log
            
            This is an automated reminder from CareSync.
            
            Best regards,
            The CareSync Team
            """, caregiverName, patientName, medicationName, dosage, scheduledTime, frontendUrl);
    }

    public String getPasswordResetBody(String fullName, String resetToken) {
        return String.format("""
            Password Reset Request
            
            Dear %s,
            
            We received a request to reset your password for your CareSync account.
            
            Click the link below to reset your password:
            %s/reset-password?token=%s
            
            This link will expire in 1 hour.
            
            If you didn't request this, please ignore this email.
            
            Best regards,
            The CareSync Team
            """, fullName, frontendUrl, resetToken);
    }

    /**
     * Medication reminder email template
     */
    public String getMedicationReminderBody(String caregiverName,
                                            String patientName,
                                            String medicationName,
                                            String dosage,
                                            LocalDateTime scheduledTime,
                                            int minutesUntilDue,
                                            String instructions) {

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");
        String timeStr = scheduledTime.format(timeFormatter);

        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(caregiverName).append(",\n\n");

        if (minutesUntilDue > 0) {
            body.append(" UPCOMING MEDICATION REMINDER\n\n");
            body.append("This is a reminder that ").append(patientName)
                    .append(" has a medication due in ").append(minutesUntilDue)
                    .append(" minutes.\n\n");
        } else {
            body.append(" OVERDUE MEDICATION ALERT\n\n");
            body.append("This is a reminder that ").append(patientName)
                    .append(" has a medication that is overdue.\n\n");
        }

        body.append("Medication Details:\n");
        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        body.append("Patient: ").append(patientName).append("\n");
        body.append("Medication: ").append(medicationName).append("\n");
        body.append("Dosage: ").append(dosage).append("\n");
        body.append("Scheduled Time: ").append(timeStr).append("\n");

        if (instructions != null && !instructions.isEmpty()) {
            body.append("Instructions: ").append(instructions).append("\n");
        }

        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

        body.append("Please ensure the medication is administered as scheduled.\n\n");
        body.append("Log into CareSync to record the administration:\n");
        body.append(frontendUrl).append("/medications/log\n\n");

        body.append("Best regards,\n");
        body.append("The CareSync Team\n\n");
        body.append("---\n");
        body.append("This is an automated reminder. Please do not reply to this email.");

        return body.toString();
    }
    public String getPasswordChangedBody(String fullName) {

        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(fullName).append(",\n\n");

        body.append("PASSWORD CHANGED SUCCESSFULLY\n\n");

        body.append("Your CareSync account password has been changed successfully.\n\n");

        body.append("If you did not make this change, please contact our support team immediately.\n\n");

        body.append("For security:\n");
        body.append("• Never share your password with anyone\n");
        body.append("• Use a strong, unique password\n");
        body.append("• Change your password regularly\n\n");

        body.append("Login at: ").append(frontendUrl).append("/login\n\n");

        body.append("Best regards,\n");
        body.append("The CareSync Team\n\n");
        body.append("---\n");
        body.append("This is an automated notification. Please do not reply to this email.");

        return body.toString();
    }
}