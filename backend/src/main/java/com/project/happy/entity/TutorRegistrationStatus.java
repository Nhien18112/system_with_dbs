package com.project.happy.entity;

public enum TutorRegistrationStatus {
    CREATING,
    PENDING, // waiting approval (12h)
    APPROVED,
    CANCELLED,
    FAILED
}
