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
                                             String email, String inviteLink) {
        return String.format("""
        Hello,
        
        %s has invited you to join the care team for %s on CareSync.
        
        Your account has been created with this email: %s
        
        Click the link below to set your password and activate your account:
        %s
        
        This link will expire in 24 hours.
        
        Once activated, you will be able to:
        - View medication schedules
        - Log medication administration
        - Track adherence
        - Coordinate with other caregivers
        
        If you did not expect this invitation, please ignore this email.
        
        Best regards,
        The CareSync Team
        """, inviterName, patientName, email, inviteLink);
    }

    /**
     * Caregiver added to existing user email template
     */
    public String getCaregiverAddedBody(String caregiverName,
                                        String inviterName,
                                        String patientName) {

        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(caregiverName).append(",\n\n");

        body.append("🤝 ADDED TO CARE TEAM\n\n");

        body.append(inviterName).append(" has added you to the care team for ")
                .append(patientName).append(".\n\n");

        body.append("You can now access this patient's information and help manage their care.\n\n");

        body.append("Login to CareSync:\n");
        body.append(frontendUrl).append("/login\n\n");

        body.append("Best regards,\n");
        body.append("The CareSync Team\n\n");
        body.append("---\n");
        body.append("This is an automated notification. Please do not reply to this email.");

        return body.toString();
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

    public String getMedicationReminderBody(
            String caregiverName,
            String patientName,
            String medicationName,
            String dosage,
            LocalDateTime scheduledTime,
            int minutesUntilDue,
            String instructions,
            String windowKey  // ← ADD THIS: "30MIN", "5MIN", or "NOW"
    ) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");
        String timeStr = scheduledTime.format(timeFormatter);

        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(caregiverName).append(",\n\n");

        // ── Header changes based on which window fired ──
        switch (windowKey) {
            case "30MIN" -> {
                body.append("⏰ UPCOMING MEDICATION REMINDER\n\n");
                body.append(patientName)
                        .append(" has a medication due in approximately 30 minutes.\n\n");
            }
            case "5MIN" -> {
                body.append("⚡ MEDICATION DUE VERY SOON\n\n");
                body.append(patientName)
                        .append(" needs their medication in about 5 minutes. Please prepare now.\n\n");
            }
            case "NOW" -> {
                body.append("🔴 TIME TO GIVE MEDICATION NOW\n\n");
                body.append("It is time to administer ")
                        .append(patientName)
                        .append("'s medication immediately.\n\n");
            }
            default -> {
                body.append("⏰ MEDICATION REMINDER\n\n");
                body.append(patientName)
                        .append(" has a medication due in ")
                        .append(minutesUntilDue)
                        .append(" minutes.\n\n");
            }
        }

        // ── Medication details block (unchanged) ──
        body.append("Medication Details:\n");
        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        body.append("Patient:          ").append(patientName).append("\n");
        body.append("Medication:       ").append(medicationName).append("\n");
        body.append("Dosage:           ").append(dosage).append("\n");
        body.append("Scheduled Time:   ").append(timeStr).append("\n");

        if (instructions != null && !instructions.isEmpty()) {
            body.append("Instructions:     ").append(instructions).append("\n");
        }

        body.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n");

        // ── Call to action changes based on urgency ──
        if ("NOW".equals(windowKey)) {
            body.append("⚠️  Please administer the medication immediately and log it in CareSync.\n\n");
        } else if ("5MIN".equals(windowKey)) {
            body.append("Please get the medication ready now and log it once administered.\n\n");
        } else {
            body.append("Please ensure the medication is administered as scheduled.\n\n");
        }

        body.append("Log the administration here:\n");
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

    public String getForgotPasswordEmailBody(String fullName, String resetLink, long expirationHours) {
        return """
            Hi %s,
            
            We received a request to reset your CareSync password.
            
            Click the link below to reset your password:
            %s
            
            This link will expire in %d hour(s).
            
            If you did not request a password reset, please ignore this email.
            Your password will remain unchanged.
            
            - CareSync Team
            """.formatted(fullName, resetLink, expirationHours);
    }
}