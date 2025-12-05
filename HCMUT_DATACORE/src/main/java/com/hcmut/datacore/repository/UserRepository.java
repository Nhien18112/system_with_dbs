package com.hcmut.datacore.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hcmut.datacore.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // tìm theo thuộc tính bkNetId trong entity User
    Optional<User> findByBkNetId(String bkNetId);
}
