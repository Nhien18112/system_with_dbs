package com.hcmut.sso.dto;

public class LoginRequest {
    private String bkNetId;
    private String password;
    private String service;

    public String getBkNetId() {
        return bkNetId;
    }
    public void setBkNetId(String bkNetId) {
        this.bkNetId = bkNetId;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public String getService() {
        return service;
    }
    public void setService(String service) {
        this.service = service;
    }
}
