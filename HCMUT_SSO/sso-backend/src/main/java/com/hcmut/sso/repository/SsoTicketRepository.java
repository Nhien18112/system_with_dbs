package com.hcmut.sso.repository;

import com.hcmut.sso.entity.SsoTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SsoTicketRepository extends JpaRepository<SsoTicket, Long> {
    Optional<SsoTicket> findByValueAndService(String value, String service);
}
