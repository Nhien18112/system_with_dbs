package com.project.happy.scheduling;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.service.tutor.TutorRegistrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class TutorRegistrationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TutorRegistrationScheduler.class);
    private final TutorRegistrationService registrationService;

    @Autowired
    public TutorRegistrationScheduler(TutorRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // Run every 5 minutes to find pending registrations older than 12 hours and auto-approve
    @Scheduled(fixedDelayString = "PT5M")
    public void autoApprovePending() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minus(12, ChronoUnit.HOURS);
            List<TutorRegistrationEntity> list = registrationService.findPendingOlderThan(cutoff);
            for (TutorRegistrationEntity r : list) {
                // Only approve if still pending
                if (r.getStatus() != null)
                    registrationService.approveRegistration(r);
                logger.info("Auto-approved registration id={}", r.getId());
            }
        } catch (Exception ex) {
            logger.error("Error in auto-approve scheduler", ex);
        }
    }
}
