drop DATABASE if EXISTS datacore_db;
CREATE DATABASE IF NOT EXISTS datacore_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE datacore_db;

CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    MS              VARCHAR(20)  UNIQUE,
    bk_net_id       VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(150) NOT NULL,
    full_name       VARCHAR(150) NOT NULL,
    role            ENUM('TUTOR','STUDENT') NOT NULL,
    faculty         VARCHAR(150),
    major           VARCHAR(150),
    phone_number    VARCHAR(30),
    gpa             DECIMAL(3,2),
    year_of_study   INT,
    qualifications  TEXT,
    status          ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (
    bk_net_id, MS, email, full_name, role,
    faculty, major, phone_number,
    gpa, year_of_study, qualifications
) VALUES
-- Tutors
('a.nguyenvan',111111, 'tutor001@hcmut.edu.vn', 'Nguyễn Văn A', 'TUTOR',
 'Computer Science', 'Software Engineering', '0901111111',
 NULL, NULL, 'MSc in Computer Science, 5 years teaching experience'),

('b.tranthi', 222222, 'tutor002@hcmut.edu.vn', 'Trần Thị B', 'TUTOR',
 'Computer Science', 'Artificial Intelligence', '0902222222',
 NULL, NULL, 'PhD in AI, Google AI Residency, 3 publications'),

('c.levan', 333333, 'tutor003@hcmut.edu.vn', 'Lê Văn C', 'TUTOR',
 'Electrical Engineering', 'Electronics', '0903333333',
 NULL, NULL, 'BEng in Electronics, Industry expert with 8 years experience'),

('d.phamthi', 444444, 'tutor004@hcmut.edu.vn', 'Phạm Thị D', 'TUTOR',
 'Mechanical Engineering', 'Robotics', '0904444444',
 NULL, NULL, 'MEng in Robotics, Research in autonomous systems'),

-- Students
('e.hoangvan', 2300000, 'student001@hcmut.edu.vn', 'Hoàng Văn E', 'STUDENT',
 'Computer Science', 'Software Engineering', '0905555555',
 3.2, 3, NULL),

('f.vuthi', 2300001, 'student002@hcmut.edu.vn', 'Vũ Thị F', 'STUDENT',
 'Computer Science', 'Data Science', '0906666666',
 3.8, 2, NULL),

('g.dangvan', 2300002, 'student003@hcmut.edu.vn', 'Đặng Văn G', 'STUDENT',
 'Electrical Engineering', 'Power Systems', '0907777777',
 2.9, 4, NULL),

('h.buithi', 2300003, 'student004@hcmut.edu.vn', 'Bùi Thị H', 'STUDENT',
 'Mechanical Engineering', 'Automotive', '0908888888',
 3.5, 3, NULL),

('i.ngovan', 2300004, 'student005@hcmut.edu.vn', 'Ngô Văn I', 'STUDENT',
 'Computer Science', 'Cybersecurity', '0909999999',
 3.1, 2, NULL),

('k.dothi', 2300005, 'student006@hcmut.edu.vn', 'Đỗ Thị K', 'STUDENT',
 'Computer Science', 'Software Engineering', '0911111111',
 2.7, 4, NULL),

('l.lyvan', 2300006, 'student007@hcmut.edu.vn', 'Lý Văn L', 'STUDENT',
 'Computer Science', 'Artificial Intelligence', '0912222222',
 3.9, 2, NULL),

('m.maithi', 2300007, 'student008@hcmut.edu.vn', 'Mai Thị M', 'STUDENT',
 'Electrical Engineering', 'Electronics', '0913333333',
 3.0, 3, NULL);
