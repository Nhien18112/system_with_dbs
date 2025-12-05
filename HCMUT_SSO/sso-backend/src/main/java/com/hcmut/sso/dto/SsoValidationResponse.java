package com.hcmut.sso.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SsoValidationResponse {
    private String bkNetId;
    private String fullName;
    private String email;
    private String role;
    
    public String getBkNetId() {
        return bkNetId;
    }
    public void setBkNetId(String bkNetId) {
        this.bkNetId = bkNetId;
    }

    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
}
