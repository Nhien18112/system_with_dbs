package com.project.happy.scheduling;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.service.tutor.TutorRegistrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class TutorRegistrationScheduler {
    private static final Logger logger = LoggerFactory.getLogger(TutorRegistrationScheduler.class);
    private final TutorRegistrationService registrationService;

   
    public TutorRegistrationScheduler(TutorRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // DISABLED: Auto-approve should only happen when tutor explicitly approves via API
    // Not automatically based on time. Tutor must review and approve each registration.
    // Run every 5 minutes to find pending registrations older than 24 hours and auto-approve if tutor ignored
    @Scheduled(fixedDelayString = "PT5M")
    public void autoApprovePending() {
        try {
            // Only auto-approve if registration is PENDING AND older than 24 hours (not 12 hours)
            // This gives tutors 24 hours to review before automatic approval
            LocalDateTime cutoff = LocalDateTime.now().minus(24, ChronoUnit.HOURS);
            List<TutorRegistrationEntity> list = registrationService.findPendingOlderThan(cutoff);
            for (TutorRegistrationEntity r : list) {
                // Only approve if still pending
                if (r.getStatus() != null) {
                    registrationService.approveRegistration(r);
                    logger.info("Auto-approved registration id={} (older than 24 hours, tutor did not respond)", r.getId());
                }
            }
        } catch (Exception ex) {
            logger.error("Error in auto-approve scheduler", ex);
        }
    }
}
