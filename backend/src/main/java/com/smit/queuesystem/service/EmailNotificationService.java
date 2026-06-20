package com.smit.queuesystem.service;

import com.smit.queuesystem.entity.Token;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final JavaMailSender mailSender;

    public void sendBookingConfirmation(Token token, int peopleAhead, int estimatedWaitMinutes) {
        if (token.getCustomerEmail() == null || token.getCustomerEmail().isBlank()) {
            return;
        }
        String subject = "Smart Queue booking confirmed - " + token.getTokenIdentifier();
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
                  <h2 style="margin-bottom:8px">Your token is confirmed</h2>
                  <p>Hello %s,</p>
                  <p>Your token <strong>%s</strong> has been booked for <strong>%s</strong>.</p>
                  <ul>
                    <li>Branch: %s</li>
                    <li>People ahead: %d</li>
                    <li>Estimated wait: %d minutes</li>
                    <li>Issued at: %s</li>
                  </ul>
                  <p>Please keep this email for reference. You will receive another alert when your turn is called.</p>
                </div>
                """.formatted(
                token.getCustomerName(),
                token.getTokenIdentifier(),
                token.getServiceQueue().getName(),
                token.getServiceQueue().getBranch().getName(),
                peopleAhead,
                estimatedWaitMinutes,
                token.getIssuedAt().format(TIME_FORMATTER)
        );
        sendHtml(token.getCustomerEmail(), subject, html);
    }

    public void sendTurnCalled(Token token) {
        if (token.getCustomerEmail() == null || token.getCustomerEmail().isBlank()) {
            return;
        }
        String subject = "It's your turn now - " + token.getTokenIdentifier();
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
                  <h2 style="margin-bottom:8px">Your turn is now active</h2>
                  <p>Hello %s,</p>
                  <p>Please proceed to <strong>%s</strong> for token <strong>%s</strong>.</p>
                  <ul>
                    <li>Queue: %s</li>
                    <li>Counter: %s</li>
                    <li>Called at: %s</li>
                  </ul>
                  <p>Thank you for using Smart Queue.</p>
                </div>
                """.formatted(
                token.getCustomerName(),
                token.getCounter() != null ? token.getCounter().getName() : "assigned counter",
                token.getTokenIdentifier(),
                token.getServiceQueue().getName(),
                token.getCounter() != null ? token.getCounter().getName() : "-",
                token.getCalledAt() != null ? token.getCalledAt().format(TIME_FORMATTER) : "-"
        );
        sendHtml(token.getCustomerEmail(), subject, html);
    }

    public boolean sendNearTurnAlert(Token token, int peopleAhead, int estimatedWaitMinutes) {
        if (token.getCustomerEmail() == null || token.getCustomerEmail().isBlank()) {
            return false;
        }
        String subject = "Your turn is coming up shortly - " + token.getTokenIdentifier();
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
                  <h2 style="margin-bottom:8px">Please be present soon</h2>
                  <p>Hello %s,</p>
                  <p>Your token <strong>%s</strong> is getting close. Only <strong>%d customer(s)</strong> are ahead of you.</p>
                  <ul>
                    <li>Queue: %s</li>
                    <li>Branch: %s</li>
                    <li>Estimated wait: %d minutes</li>
                  </ul>
                  <p>Your turn will arrive shortly, so please be present near the service area.</p>
                </div>
                """.formatted(
                token.getCustomerName(),
                token.getTokenIdentifier(),
                peopleAhead,
                token.getServiceQueue().getName(),
                token.getServiceQueue().getBranch().getName(),
                estimatedWaitMinutes
        );
        sendHtml(token.getCustomerEmail(), subject, html);
        return true;
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException ex) {
            log.error("Failed to send email to {}", to, ex);
        }
    }
}
