package com.bo.caresync.service.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/7/2026, 12:16 PM
 **/
@Service
public class EmailTemplateService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public String getWelcomeEmailBody(String fullName, String email) {
        return String.format("""
                Dear %s,

                Thank you for joining CareSync. Your account has been created and you can now start\s
                managing medications and coordinating care for your loved ones.

                You can sign in using the email address associated with your account: %s

                To get started, visit: %s/login

                If you have any questions or need assistance, please do not hesitate to reach out to\s
                our support team.

                Regards,
                The CareSync Team
                """, fullName, email, frontendUrl);
    }

    public String getCaregiverInvitationBody(String inviterName, String patientName,
                                             String email, String inviteLink) {
        return String.format("""
                Hello,

                %s has added you to the care team for %s on CareSync.

                An account has been created for you using this email address: %s

                To set your password and activate your account, please follow the link below:
                %s

                This link will expire in 24 hours. Once your account is active, you will be able to\s
                view medication schedules, log administrations, track adherence, and coordinate with\s
                other caregivers on the team.

                If you were not expecting this invitation, you can safely ignore this email.

                Regards,
                The CareSync Team
                """, inviterName, patientName, email, inviteLink);
    }

    public String getCaregiverAddedBody(String caregiverName,
                                        String inviterName,
                                        String patientName) {
        return String.format("""
                Dear %s,

                %s has added you to the care team for %s on CareSync. You now have access to this\s
                patient's information and can assist in managing their care.

                You can sign in to your account at: %s/login

                Regards,
                The CareSync Team

                ---
                This is an automated notification. Please do not reply to this email.
                """, caregiverName, inviterName, patientName, frontendUrl);
    }

    public String getMedicationLoggedBody(String caregiverName, String patientName,
                                          String medicationName, String dosage, String time) {
        return String.format("""
                Hello,

                This is a notification that %s has logged a medication for %s.

                Medication: %s
                Dosage: %s
                Time administered: %s

                You can view the full details by signing in at: %s/patients

                Regards,
                The CareSync Team
                """, caregiverName, patientName, medicationName, dosage, time, frontendUrl);
    }

    public String getPermissionGrantedBody(String granterName, String patientName,
                                           String permissionName, String expiresAt) {
        String expiryText = expiresAt != null
                ? "This permission is set to expire on " + expiresAt + "."
                : "This permission has no expiration date.";

        return String.format("""
                Hello,

                %s has granted you the following permission for %s: %s.

                %s

                You can review and manage permissions by signing in at: %s/patients

                Regards,
                The CareSync Team
                """, granterName, patientName, permissionName, expiryText, frontendUrl);
    }

    public String getDuplicateDoseWarningBody(String caregiverName, String patientName,
                                              String medicationName, String previousTime,
                                              String previousCaregiver) {
        return String.format("""
                Hello,

                A potential duplicate medication administration has been detected for %s.

                The medication %s was already administered by %s at %s. %s is now attempting to\s
                administer the same medication.

                Please verify with the care team before proceeding to avoid an accidental double dose.

                You can review the full medication history at: %s/patients

                This is an automated safety alert from CareSync. Please do not reply to this email.

                Regards,
                The CareSync Team
                """, patientName, medicationName, previousCaregiver, previousTime,
                caregiverName, frontendUrl);
    }

    public String getMedicationReminderBody(String caregiverName, String patientName,
                                            String medicationName, String dosage,
                                            String scheduledTime) {
        return String.format("""
                Hello %s,

                This is a reminder that %s is due to receive a medication at the scheduled time.

                Medication: %s
                Dosage: %s
                Scheduled time: %s

                Once administered, please log it at: %s/medications/log

                Regards,
                The CareSync Team
                """, caregiverName, patientName, medicationName, dosage, scheduledTime, frontendUrl);
    }

    public String getPasswordResetBody(String fullName, String resetToken) {
        return String.format("""
                Dear %s,

                We received a request to reset the password for your CareSync account.

                You can reset your password by visiting the link below:
                %s/reset-password?token=%s

                This link will expire in 1 hour. If you did not request a password reset, you can\s
                safely ignore this email and your password will remain unchanged.

                Regards,
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
            String windowKey
    ) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");
        String timeStr = scheduledTime.format(timeFormatter);

        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(caregiverName).append(",\n\n");

        switch (windowKey) {
            case "30MIN" -> body.append(patientName)
                    .append(" has a medication scheduled in approximately 30 minutes.\n\n");
            case "5MIN" -> body.append(patientName)
                    .append("'s medication is due in about 5 minutes. Please prepare now.\n\n");
            case "NOW" -> body.append("It is time to administer ")
                    .append(patientName)
                    .append("'s medication. Please do so as soon as possible.\n\n");
            default -> body.append(patientName)
                    .append(" has a medication due in ")
                    .append(minutesUntilDue)
                    .append(" minutes.\n\n");
        }

        body.append("Patient:         ").append(patientName).append("\n");
        body.append("Medication:      ").append(medicationName).append("\n");
        body.append("Dosage:          ").append(dosage).append("\n");
        body.append("Scheduled time:  ").append(timeStr).append("\n");

        if (instructions != null && !instructions.isBlank()) {
            body.append("Instructions:    ").append(instructions).append("\n");
        }

        body.append("\n");

        switch (windowKey) {
            case "NOW" -> body.append("Please administer the medication now and log it in CareSync.\n\n");
            case "5MIN" -> body.append("Please prepare the medication and log it once administered.\n\n");
            default -> body.append("Please ensure the medication is administered as scheduled.\n\n");
        }

        body.append("Log the administration here: ").append(frontendUrl).append("/medications/log\n\n");
        body.append("Regards,\n");
        body.append("The CareSync Team\n\n");
        body.append("---\n");
        body.append("This is an automated reminder. Please do not reply to this email.");

        return body.toString();
    }

    public String getPasswordChangedBody(String fullName) {
        return String.format("""
                Dear %s,

                Your CareSync account password has been changed successfully.

                If you did not make this change, please contact our support team right away, as your\s
                account may have been accessed without your permission.

                As a general reminder, avoid sharing your password with anyone and consider using a\s
                strong, unique password that you update periodically.

                You can sign in at: %s/login

                Regards,
                The CareSync Team

                ---
                This is an automated notification. Please do not reply to this email.
                """, fullName, frontendUrl);
    }

    public String getForgotPasswordEmailBody(String fullName, String resetLink, long expirationHours) {
        return String.format("""
                Hi %s,

                We received a request to reset the password for your CareSync account. You can do so\s
                by clicking the link below:

                %s

                This link will expire in %d hour(s). If you did not request a password reset, you\s
                can ignore this email. Your password will not be changed.

                Regards,
                The CareSync Team
                """, fullName, resetLink, expirationHours);
    }
}