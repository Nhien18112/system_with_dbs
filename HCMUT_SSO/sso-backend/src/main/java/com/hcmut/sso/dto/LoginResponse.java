package com.hcmut.sso.dto;

public class LoginResponse {
    private String ticket;
    private String redirectUrl;
    private String bkNetId;

    public String getTicket() {
        return ticket;
    }
    public void setTicket(String ticket) {
        this.ticket = ticket;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }
    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public String getBkNetId() {
        return bkNetId;
    }
    public void setBkNetId(String bkNetId) {
        this.bkNetId = bkNetId;
    }
}
