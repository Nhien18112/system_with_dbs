package com.hcmut.sso.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.hcmut.sso.dto.LoginRequest;
import com.hcmut.sso.dto.LoginResponse;
import com.hcmut.sso.dto.SsoValidationResponse;
import com.hcmut.sso.entity.SsoTicket;
import com.hcmut.sso.entity.SsoUser;
import com.hcmut.sso.repository.SsoTicketRepository;
import com.hcmut.sso.repository.SsoUserRepository;

@RestController
@RequestMapping("/api/sso")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class SsoAuthController {

    private final SsoUserRepository userRepository;
    private final SsoTicketRepository ticketRepository;
    private final WebClient datacoreClient;

    public SsoAuthController(SsoUserRepository userRepository,
                             SsoTicketRepository ticketRepository,
                             WebClient datacoreWebClient) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.datacoreClient = datacoreWebClient;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Lấy user
        SsoUser user = userRepository.findByBkNetId(request.getBkNetId())
                .orElseThrow(() -> new RuntimeException("Invalid account"));

        // Kiểm tra mật khẩu
        String raw = user.getPasswordHash();
        String stored = raw != null && raw.startsWith("{noop}") ? raw.substring(6) : raw;
        if (!stored.equals(request.getPassword())) {
            return ResponseEntity.status(401).body("Sai mật khẩu");
        }

        // Tạo ticket
        String ticketValue = "TICKET-" + UUID.randomUUID();
        SsoTicket ticket = new SsoTicket();
        ticket.setValue(ticketValue);
        ticket.setBkNetId(user.getBkNetId());
        ticket.setService(request.getService());  // Lưu đúng service
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        ticketRepository.save(ticket); // phải gọi save

        // Trả redirect URL
        String redirectUrl = request.getService()
                + (request.getService().contains("?") ? "&" : "?")
                + "ticket=" + URLEncoder.encode(ticketValue, StandardCharsets.UTF_8)
                + "&bkNetId=" + URLEncoder.encode(user.getBkNetId(), StandardCharsets.UTF_8);

        LoginResponse resp = new LoginResponse();
        resp.setTicket(ticketValue);
        resp.setRedirectUrl(redirectUrl);
        resp.setBkNetId(user.getBkNetId());

        return ResponseEntity.ok(resp);
    }


    @GetMapping("/service-validate")
    public ResponseEntity<?> validate(
            @RequestParam("ticket") String ticket,
            @RequestParam String service) {

        SsoTicket t = ticketRepository.findByValueAndService(ticket, service)
                .orElseThrow(() -> new RuntimeException("Ticket không tồn tại"));

        if (t.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body("Ticket hết hạn");
        }

        // Lấy thông tin user
        SsoValidationResponse profile = datacoreClient.get()
                .uri("/api/users/{bkNetId}", t.getBkNetId())
                .retrieve()
                .bodyToMono(SsoValidationResponse.class)
                .block();

        ticketRepository.delete(t); // xóa ticket sau khi validate thành công
        return ResponseEntity.ok(profile);
    }
}
