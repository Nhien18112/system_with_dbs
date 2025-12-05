package com.hcmut.datacore.dto;

public class UserProfileDto {

    private String bkNetId;
    private String email;
    private String MS;
    private String fullName;
    private String role;
    private String faculty;
    private String major;
    private String phoneNumber;
    private Double gpa;
    private Integer yearOfStudy;
    private String qualifications;

    public String getBkNetId() {
        return bkNetId;
    }

    public String getMS() {
        return MS;
    }
    
    public void setMS(String MS) {
        this.MS = MS;
    }
    public void setBkNetId(String bkNetId) {
        this.bkNetId = bkNetId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFaculty() {
        return faculty;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Double getGpa() {
        return gpa;
    }

    public void setGpa(Double gpa) {
        this.gpa = gpa;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public String getQualifications() {
        return qualifications;
    }

    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }
}
