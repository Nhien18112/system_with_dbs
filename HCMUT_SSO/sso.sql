
CREATE DATABASE IF NOT EXISTS sso_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sso_db;

CREATE TABLE sso_users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    bk_net_id     VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150),
    email         VARCHAR(150),
    active        TINYINT(1) DEFAULT 1
);

CREATE TABLE sso_tickets (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    value      VARCHAR(100) NOT NULL UNIQUE,
    bk_net_id  VARCHAR(50)  NOT NULL,
    service    VARCHAR(255) NOT NULL,
    used       TINYINT(1) DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

ALTER TABLE sso_tickets
  ADD CONSTRAINT fk_sso_tickets_user
  FOREIGN KEY (bk_net_id) REFERENCES sso_users(bk_net_id)
  ON DELETE CASCADE;

INSERT INTO sso_users (bk_net_id, password_hash, full_name, email)
VALUES
  -- Tutors
  ('a.nguyenvan', '{noop}123456', 'Nguyễn Văn A', 'a.nguyenvan@hcmut.edu.vn'),
  ('b.tranthi',   '{noop}123456', 'Trần Thị B',  'b.tranthi@hcmut.edu.vn'),
  ('c.levan',     '{noop}123456', 'Lê Văn C',    'c.levan@hcmut.edu.vn'),
  ('d.phamthi',   '{noop}123456', 'Phạm Thị D',  'd.phamthi@hcmut.edu.vn'),

  -- Students
  ('e.hoangvan',  '{noop}123456', 'Hoàng Văn E', 'e.hoangvan@hcmut.edu.vn'),
  ('f.vuthi',     '{noop}123456', 'Vũ Thị F',    'f.vuthi@hcmut.edu.vn'),
  ('g.dangvan',   '{noop}123456', 'Đặng Văn G',  'g.dangvan@hcmut.edu.vn'),
  ('h.buithi',    '{noop}123456', 'Bùi Thị H',   'h.buithi@hcmut.edu.vn'),
  ('i.ngovan',    '{noop}123456', 'Ngô Văn I',   'i.ngovan@hcmut.edu.vn'),
  ('k.dothi',     '{noop}123456', 'Đỗ Thị K',    'k.dothi@hcmut.edu.vn'),
  ('l.lyvan',     '{noop}123456', 'Lý Văn L',    'l.lyvan@hcmut.edu.vn'),
  ('m.maithi',    '{noop}123456', 'Mai Thị M',   'm.maithi@hcmut.edu.vn');
