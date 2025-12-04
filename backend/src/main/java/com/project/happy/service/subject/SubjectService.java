package com.project.happy.service.subject;

import com.project.happy.entity.SubjectEntity;
import com.project.happy.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {
    private final SubjectRepository subjectRepository;

    @Autowired
    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public List<SubjectEntity> getAllSubjects() {
        return subjectRepository.findAll();
    }
}
