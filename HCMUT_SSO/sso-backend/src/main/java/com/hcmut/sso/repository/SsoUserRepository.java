package com.hcmut.sso.repository;

import com.hcmut.sso.entity.SsoUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SsoUserRepository extends JpaRepository<SsoUser, Long> {
    Optional<SsoUser> findByBkNetId(String bkNetId);
}
