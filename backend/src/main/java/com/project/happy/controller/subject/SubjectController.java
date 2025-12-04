package com.project.happy.controller.subject;

import com.project.happy.entity.SubjectEntity;
import com.project.happy.service.subject.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {
    private final SubjectService subjectService;

    @Autowired
    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping("")
    public List<SubjectEntity> getAllSubjects() {
        System.out.println("Fetching all subjects...");
        List<SubjectEntity> subjects = subjectService.getAllSubjects();
        System.out.println("Found " + subjects.size() + " subjects");
        return subjects;
    }
}
