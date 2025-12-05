package com.hcmut.datacore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hcmut.datacore.dto.UserProfileDto;
import com.hcmut.datacore.repository.UserRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository repository;

    public UserController(UserRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/users/{bkNetId}")
    public ResponseEntity<?> getUser(@PathVariable String bkNetId) {

        return repository.findByBkNetId(bkNetId)
                .map(user -> {
                    UserProfileDto dto = new UserProfileDto();
                    dto.setBkNetId(user.getBkNetId());
                    dto.setEmail(user.getEmail());
                    dto.setFullName(user.getFullName());
                    dto.setRole(user.getRole());
                    dto.setFaculty(user.getFaculty());
                    dto.setMajor(user.getMajor());
                    dto.setPhoneNumber(user.getPhoneNumber());
                    dto.setGpa(user.getGpa());
                    dto.setMS(user.getMS());
                    dto.setYearOfStudy(user.getYearOfStudy());
                    dto.setQualifications(user.getQualifications());
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
