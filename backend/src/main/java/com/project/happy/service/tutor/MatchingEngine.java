package com.project.happy.service.tutor;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

// Simple mock of a matching engine. In real system, integrate with HCMUT_DATACORE
@Component
public class MatchingEngine {

    public static record TutorSuggestion(String tutorId, String name, double rating, int availableSlots) {}

    public List<TutorSuggestion> suggestTutors(String subject) {
        // Mock: return a small list. Real implementation would query tutor service
        List<TutorSuggestion> list = new ArrayList<>();
        list.add(new TutorSuggestion("tutor-1", "Nguyen Van A", 4.8, 2));
        list.add(new TutorSuggestion("tutor-2", "Tran Thi B", 4.6, 1));
        return list;
    }
}
