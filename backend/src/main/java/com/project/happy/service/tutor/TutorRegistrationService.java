package com.project.happy.service.tutor;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.entity.TutorRegistrationStatus;
import com.project.happy.repository.TutorRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TutorRegistrationService {

    private final TutorRegistrationRepository repository;

    @Autowired
    public TutorRegistrationService(TutorRegistrationRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public TutorRegistrationEntity createRequest(String studentId, String subject, String tutorId) {
        TutorRegistrationEntity entity = new TutorRegistrationEntity();
        entity.setStudentId(studentId);
        entity.setSubject(subject);
        entity.setTutorId(tutorId);
        entity.setStatus(TutorRegistrationStatus.PENDING);
        entity.setRequestTime(LocalDateTime.now());
        return repository.save(entity);
    }

    @Transactional
    public boolean cancelRequest(Long registrationId, String studentId) {
        Optional<TutorRegistrationEntity> opt = repository.findById(registrationId);
        if (opt.isEmpty()) return false;
        TutorRegistrationEntity r = opt.get();
        if (!r.getStudentId().equals(studentId)) return false;
        if (r.getStatus() == TutorRegistrationStatus.PENDING || r.getStatus() == TutorRegistrationStatus.CREATING) {
            r.setStatus(TutorRegistrationStatus.CANCELLED);
            repository.save(r);
            return true;
        }
        return false;
    }

    public List<TutorRegistrationEntity> findPendingOlderThan(LocalDateTime cutoff) {
        return repository.findByStatusAndRequestTimeBefore(TutorRegistrationStatus.PENDING, cutoff);
    }

    @Transactional
    public void approveRegistration(TutorRegistrationEntity registration) {
        registration.setStatus(TutorRegistrationStatus.APPROVED);
        repository.save(registration);
    }
}
