-- Tạo database
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS SW_PROJECT;

SET FOREIGN_KEY_CHECKS = 1;
CREATE DATABASE IF NOT EXISTS SW_PROJECT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE SW_PROJECT;

-- Bảng người dùng (cải tiến với fields cho AI matching và slot cho tutor)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    bk_net_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TUTOR', 'COORDINATOR') NOT NULL,
    faculty VARCHAR(100),
    major VARCHAR(100),
    phone_number VARCHAR(20),
    -- New fields for AI matching
    gpa DECIMAL(3,2),
    year_of_study INT,
    qualifications TEXT,
    max_slots INT DEFAULT 15, -- Giới hạn số lượng sinh viên tutor có thể nhận
    current_slots INT DEFAULT 0, -- Số lượng sinh viên hiện tại
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng môn học/chuyên ngành
CREATE TABLE subjects (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    description TEXT,
    faculty VARCHAR(100),
    difficulty_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chuyên môn của tutor
CREATE TABLE tutor_expertise (
    expertise_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    subject_id INT NOT NULL,
    proficiency_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
    years_of_experience INT,
    hourly_rate DECIMAL(8,2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tutor_id, subject_id),
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

-- Bảng đăng ký tutor của sinh viên (theo yêu cầu: chỉ lưu sinh viên đã được duyệt)
CREATE TABLE tutor_registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    subject_id INT NOT NULL,
    registration_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

-- Bảng lịch rảnh của tutor
CREATE TABLE tutor_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('AVAILABLE', 'BOOKED', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng buổi tư vấn (cải tiến với reminder_sent)
CREATE TABLE consultations (
    consultation_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    consultation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    consultation_mode ENUM('ONLINE', 'OFFLINE', 'HYBRID') NOT NULL,
    max_participants INT DEFAULT 1,
    current_participants INT DEFAULT 0,
    room_id INT,
    online_link VARCHAR(500),
    reminder_sent BOOLEAN DEFAULT FALSE, -- New field
    status ENUM('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng lịch hẹn cá nhân (cải tiến với reminder_sent)
CREATE TABLE appointments (
    -- ID và Khóa
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Thuộc tính CHUNG từ Meeting
    tutor_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    topic VARCHAR(255),
    description TEXT,
    online_link VARCHAR(500),
    status ENUM('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED') 
        NOT NULL DEFAULT 'SCHEDULED',
    meeting_type ENUM('APPOINTMENT', 'CONSULTATION') 
        NOT NULL DEFAULT 'APPOINTMENT',
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    
    -- Thuộc tính RIÊNG
    student_id INT NOT NULL,
    availability_id INT NOT NULL, 
    appointment_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') 
        NOT NULL DEFAULT 'PENDING',
    reject_reason TEXT,
    
    -- Các trường quản lý
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (availability_id) REFERENCES tutor_availability(availability_id) 
        ON DELETE CASCADE
);

-- Bảng đăng ký tham gia buổi tư vấn
CREATE TABLE consultation_registrations (
    registration_id INT AUTO_INCREMENT PRIMARY KEY,
    consultation_id INT NOT NULL,
    student_id INT NOT NULL,
    registration_status ENUM('REGISTERED', 'ATTENDED', 'CANCELLED') DEFAULT 'REGISTERED',
    waitlist_position INT DEFAULT 0,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(consultation_id, student_id),
    FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng tài liệu học tập (cải tiến với library integration)
CREATE TABLE learning_materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(50),
    subject_id INT,
    -- New fields for HCMUT_LIBRARY integration
    library_id VARCHAR(50), -- Link to external library system
    is_public BOOLEAN DEFAULT TRUE,
    tags JSON, -- For better search (MySQL uses JSON instead of TEXT[])
    material_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_date TIMESTAMP NULL,
    download_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL
);

-- Bảng phản hồi chất lượng buổi học (cải tiến với anonymous feedback)
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    consultation_id INT,
    appointment_id INT,
    rating INT NOT NULL,
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE, -- New field
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- Bảng ghi nhận tiến độ học tập (cải tiến với goals tracking)
CREATE TABLE progress_records (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    student_id INT NOT NULL,
    consultation_id INT,
    appointment_id INT,
    learning_content TEXT NOT NULL,
    assessment TEXT,
    progress_notes TEXT,
    -- New fields for goals tracking
    goals_set TEXT,
    goals_achieved TEXT,
    next_steps TEXT,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- Bảng khung chương trình chung
CREATE TABLE curriculum_frameworks (
    framework_id INT AUTO_INCREMENT PRIMARY KEY,
    coordinator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topics TEXT NOT NULL,
    duration_hours INT NOT NULL,
    learning_objectives TEXT,
    required_materials TEXT,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coordinator_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng báo cáo
CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    coordinator_id INT NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    report_period VARCHAR(50),
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(500),
    file_format ENUM('PDF', 'EXCEL', 'CSV'),
    status ENUM('GENERATED', 'SENT', 'FAILED') DEFAULT 'GENERATED',
    sent_date TIMESTAMP NULL,
    FOREIGN KEY (coordinator_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng phòng học
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(20) UNIQUE NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor INT,
    capacity INT NOT NULL,
    facilities JSON, -- MySQL uses JSON instead of TEXT[]
    equipment JSON,  -- MySQL uses JSON instead of TEXT[]
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') DEFAULT 'AVAILABLE'
);

-- Bảng thông báo (cải tiến với notification types)
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM(
        'APPOINTMENT', 'CONSULTATION', 'FEEDBACK', 'REPORT', 
        'REGISTRATION', 'MATERIAL', 'SYSTEM', 'REMINDER'
    ) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng lịch sử hoạt động
CREATE TABLE activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng AI matching suggestions (NEW)
CREATE TABLE matching_suggestions (
    suggestion_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    subject_id INT NOT NULL,
    match_score DECIMAL(5,2) NOT NULL,
    match_reasons JSON, -- Reasons for the match
    is_accepted BOOLEAN DEFAULT NULL,
    suggested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    UNIQUE(student_id, tutor_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
);

-- Bảng học phí (NEW - nếu có tính phí)
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    appointment_id INT,
    consultation_id INT,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    payment_method VARCHAR(50),
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (consultation_id) REFERENCES consultations(consultation_id) ON DELETE SET NULL
);

-- Tạo indexes để tối ưu hiệu năng
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_bk_net_id ON users(bk_net_id);
CREATE INDEX idx_users_gpa ON users(gpa);
CREATE INDEX idx_users_faculty ON users(faculty);
CREATE INDEX idx_users_slots ON users(current_slots, max_slots);

CREATE INDEX idx_tutor_availability_tutor_date ON tutor_availability(tutor_id, available_date);
CREATE INDEX idx_tutor_availability_status ON tutor_availability(status);

CREATE INDEX idx_appointments_status ON appointments(appointment_status);
CREATE INDEX idx_appointments_student ON appointments(student_id);
CREATE INDEX idx_appointments_tutor ON appointments(tutor_id);

CREATE INDEX idx_consultations_tutor_date ON consultations(tutor_id, consultation_date);
CREATE INDEX idx_consultations_status ON consultations(status);

CREATE INDEX idx_feedback_tutor_date ON feedback(tutor_id, feedback_date);
CREATE INDEX idx_feedback_rating ON feedback(rating);

CREATE INDEX idx_materials_status ON learning_materials(material_status);
CREATE INDEX idx_materials_subject ON learning_materials(subject_id);
CREATE INDEX idx_materials_upload_date ON learning_materials(upload_date);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);

CREATE INDEX idx_matching_scores ON matching_suggestions(match_score);
CREATE INDEX idx_matching_student ON matching_suggestions(student_id);
CREATE INDEX idx_matching_tutor ON matching_suggestions(tutor_id);

-- Full-text search indexes
CREATE FULLTEXT INDEX idx_learning_materials_search ON learning_materials(title, description);
CREATE FULLTEXT INDEX idx_subjects_search ON subjects(subject_name, description);

-- Composite indexes thay cho partial indexes
CREATE INDEX idx_tutor_expertise_available ON tutor_expertise(tutor_id, is_available);
CREATE INDEX idx_tutor_registrations_pending ON tutor_registrations(tutor_id, registration_status);
CREATE INDEX idx_consultations_active ON consultations(tutor_id, status);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- =============================================
-- STORED FUNCTIONS AND PROCEDURES
-- =============================================

DELIMITER //

-- Function để tính match score AI
CREATE FUNCTION calculate_match_score(
    p_student_id INT,
    p_tutor_id INT,
    p_subject_id INT
) RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_score DECIMAL(5,2) DEFAULT 0;
    DECLARE v_student_gpa DECIMAL(3,2);
    DECLARE v_tutor_exp INT;
    DECLARE v_proficiency_level VARCHAR(20);
    DECLARE v_faculty_match BOOLEAN DEFAULT FALSE;
    DECLARE v_tutor_slots_available INT;
    
    -- Get student GPA
    SELECT gpa INTO v_student_gpa FROM users WHERE user_id = p_student_id;
    
    -- Get tutor expertise
    SELECT years_of_experience, proficiency_level 
    INTO v_tutor_exp, v_proficiency_level
    FROM tutor_expertise 
    WHERE tutor_id = p_tutor_id AND subject_id = p_subject_id;
    
    -- Check faculty match
    SELECT COUNT(*) > 0 INTO v_faculty_match
    FROM users s
    JOIN users t ON s.faculty = t.faculty
    WHERE s.user_id = p_student_id AND t.user_id = p_tutor_id;
    
    -- Check tutor slots availability
    SELECT (max_slots - current_slots) INTO v_tutor_slots_available
    FROM users WHERE user_id = p_tutor_id;
    
    -- Calculate score (simplified algorithm)
    SET v_score = 50; -- Base score
    
    -- GPA factor (students with lower GPA get higher priority)
    IF v_student_gpa IS NOT NULL THEN
        SET v_score = v_score + (20 * (1 - v_student_gpa/4.0));
    END IF;
    
    -- Experience factor
    IF v_tutor_exp IS NOT NULL THEN
        SET v_score = v_score + (v_tutor_exp * 2);
    END IF;
    
    -- Proficiency factor
    CASE v_proficiency_level
        WHEN 'EXPERT' THEN SET v_score = v_score + 15;
        WHEN 'ADVANCED' THEN SET v_score = v_score + 10;
        WHEN 'INTERMEDIATE' THEN SET v_score = v_score + 5;
        ELSE SET v_score = v_score + 0;
    END CASE;
    
    -- Faculty match bonus
    IF v_faculty_match THEN
        SET v_score = v_score + 10;
    END IF;
    
    -- Slots availability bonus (more slots available = higher score)
    IF v_tutor_slots_available IS NOT NULL AND v_tutor_slots_available > 0 THEN
        SET v_score = v_score + (v_tutor_slots_available * 1.5);
    END IF;
    
    -- Ensure score is between 0-100
    SET v_score = GREATEST(0, LEAST(100, v_score));
    
    RETURN v_score;
END //

-- Procedure để kiểm tra và cập nhật số lượng slot của tutor
CREATE PROCEDURE check_and_update_tutor_slots(
    IN p_tutor_id INT,
    IN p_action ENUM('INCREMENT', 'DECREMENT')
)
BEGIN
    DECLARE v_current_slots INT;
    DECLARE v_max_slots INT;
    
    SELECT current_slots, max_slots INTO v_current_slots, v_max_slots
    FROM users WHERE user_id = p_tutor_id AND role = 'TUTOR';
    
    IF p_action = 'INCREMENT' THEN
        IF v_current_slots < v_max_slots THEN
            UPDATE users 
            SET current_slots = current_slots + 1
            WHERE user_id = p_tutor_id;
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tutor has reached maximum slots';
        END IF;
    ELSEIF p_action = 'DECREMENT' THEN
        IF v_current_slots > 0 THEN
            UPDATE users 
            SET current_slots = current_slots - 1
            WHERE user_id = p_tutor_id;
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No slots to decrement';
        END IF;
    END IF;
END //

-- Procedures
CREATE PROCEDURE auto_approve_tutor_registrations()
BEGIN
    UPDATE tutor_registrations 
    SET registration_status = 'APPROVED', 
        approved_at = CURRENT_TIMESTAMP
    WHERE registration_status = 'PENDING' 
    AND expires_at <= CURRENT_TIMESTAMP;
END //

CREATE PROCEDURE cleanup_old_data()
BEGIN
    -- Delete old activity logs (older than 1 year)
    DELETE FROM activity_logs WHERE created_at < CURRENT_TIMESTAMP - INTERVAL 1 YEAR;
    
    -- Delete old notifications (older than 6 months)
    DELETE FROM notifications WHERE created_at < CURRENT_TIMESTAMP - INTERVAL 6 MONTH;
    
    -- Delete expired matching suggestions
    DELETE FROM matching_suggestions WHERE expires_at < CURRENT_TIMESTAMP;
    
    SELECT 'Cleanup completed' as message;
END //

-- =============================================
-- TRIGGERS FOR VALIDATION
-- =============================================

-- Triggers cho users
CREATE TRIGGER validate_user_gpa
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.gpa IS NOT NULL AND (NEW.gpa < 0 OR NEW.gpa > 4.0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'GPA must be between 0 and 4.0';
    END IF;
END //

CREATE TRIGGER validate_user_year
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.year_of_study IS NOT NULL AND (NEW.year_of_study < 1 OR NEW.year_of_study > 6) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Year of study must be between 1 and 6';
    END IF;
END //

CREATE TRIGGER validate_tutor_slots
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'TUTOR' THEN
        IF NEW.max_slots IS NULL THEN
            SET NEW.max_slots = 15;
        END IF;
        IF NEW.current_slots IS NULL THEN
            SET NEW.current_slots = 0;
        END IF;
        IF NEW.current_slots > NEW.max_slots THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Current slots cannot exceed max slots';
        END IF;
    END IF;
END //

-- Triggers cho tutor_availability
CREATE TRIGGER validate_availability_time
BEFORE INSERT ON tutor_availability
FOR EACH ROW
BEGIN
    IF NEW.end_time <= NEW.start_time THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End time must be greater than start time';
    END IF;
END //

CREATE TRIGGER validate_tutor_availability_role
BEFORE INSERT ON tutor_availability
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    
    SELECT role INTO user_role FROM users WHERE user_id = NEW.tutor_id;
    
    IF user_role != 'TUTOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a tutor';
    END IF;
END //

-- Triggers cho consultations
CREATE TRIGGER validate_consultation_time
BEFORE INSERT ON consultations
FOR EACH ROW
BEGIN
    IF NEW.end_time <= NEW.start_time THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End time must be greater than start time';
    END IF;
END //

CREATE TRIGGER validate_consultation_participants
BEFORE INSERT ON consultations
FOR EACH ROW
BEGIN
    IF NEW.current_participants > NEW.max_participants THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Current participants cannot exceed max participants';
    END IF;
END //

CREATE TRIGGER validate_consultation_role
BEFORE INSERT ON consultations
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    
    SELECT role INTO user_role FROM users WHERE user_id = NEW.tutor_id;
    
    IF user_role != 'TUTOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a tutor';
    END IF;
END //

-- Triggers cho appointments
CREATE TRIGGER validate_appointment_roles
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    DECLARE student_role VARCHAR(20);
    DECLARE tutor_role VARCHAR(20);
    
    SELECT role INTO student_role FROM users WHERE user_id = NEW.student_id;
    SELECT role INTO tutor_role FROM users WHERE user_id = NEW.tutor_id;
    
    IF student_role != 'STUDENT' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a student';
    END IF;
    
    IF tutor_role != 'TUTOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a tutor';
    END IF;
END //

-- Triggers cho tutor_registrations
CREATE TRIGGER validate_tutor_registration_roles
BEFORE INSERT ON tutor_registrations
FOR EACH ROW
BEGIN
    DECLARE student_role VARCHAR(20);
    DECLARE tutor_role VARCHAR(20);
    
    SELECT role INTO student_role FROM users WHERE user_id = NEW.student_id;
    SELECT role INTO tutor_role FROM users WHERE user_id = NEW.tutor_id;
    
    IF student_role != 'STUDENT' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a student';
    END IF;
    
    IF tutor_role != 'TUTOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a tutor';
    END IF;
END //

-- Trigger để kiểm tra slot của tutor khi đăng ký
CREATE TRIGGER check_tutor_slots_before_registration
BEFORE INSERT ON tutor_registrations
FOR EACH ROW
BEGIN
    DECLARE v_current_slots INT;
    DECLARE v_max_slots INT;
    
    SELECT current_slots, max_slots INTO v_current_slots, v_max_slots
    FROM users WHERE user_id = NEW.tutor_id;
    
    IF v_current_slots >= v_max_slots THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tutor has reached maximum number of students';
    END IF;
END //

-- Nếu một đăng ký được chèn trực tiếp với trạng thái APPROVED,
-- đảm bảo trường `approved_at` được đặt và cập nhật slot tutor.
CREATE TRIGGER set_approved_at_before_insert_tutor_registrations
BEFORE INSERT ON tutor_registrations
FOR EACH ROW
BEGIN
    IF NEW.registration_status = 'APPROVED' THEN
        IF NEW.approved_at IS NULL THEN
            SET NEW.approved_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
END //

-- Nếu một đăng ký được cập nhật thành APPROVED, đặt `approved_at` trước khi lưu
CREATE TRIGGER set_approved_at_before_update_tutor_registrations
BEFORE UPDATE ON tutor_registrations
FOR EACH ROW
BEGIN
    IF NEW.registration_status = 'APPROVED' AND OLD.registration_status != 'APPROVED' THEN
        IF NEW.approved_at IS NULL THEN
            SET NEW.approved_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
END //

-- Nếu một đăng ký được chèn trực tiếp với trạng thái APPROVED,
-- tăng `current_slots` của tutor ngay sau khi insert
CREATE TRIGGER update_tutor_slots_on_insert_approval
AFTER INSERT ON tutor_registrations
FOR EACH ROW
BEGIN
    IF NEW.registration_status = 'APPROVED' THEN
        CALL check_and_update_tutor_slots(NEW.tutor_id, 'INCREMENT');
    END IF;
END //

-- Trigger để cập nhật slot khi đăng ký được approved
CREATE TRIGGER update_tutor_slots_on_approval
AFTER UPDATE ON tutor_registrations
FOR EACH ROW
BEGIN
    IF NEW.registration_status = 'APPROVED' AND OLD.registration_status != 'APPROVED' THEN
        CALL check_and_update_tutor_slots(NEW.tutor_id, 'INCREMENT');
    ELSEIF NEW.registration_status != 'APPROVED' AND OLD.registration_status = 'APPROVED' THEN
        CALL check_and_update_tutor_slots(NEW.tutor_id, 'DECREMENT');
    END IF;
END //

-- Triggers cho consultation_registrations
CREATE TRIGGER validate_consultation_registration_role
BEFORE INSERT ON consultation_registrations
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    
    SELECT role INTO user_role FROM users WHERE user_id = NEW.student_id;
    
    IF user_role != 'STUDENT' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a student';
    END IF;
END //

-- Triggers cho learning_materials
CREATE TRIGGER validate_material_upload_role
BEFORE INSERT ON learning_materials
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    
    SELECT role INTO user_role FROM users WHERE user_id = NEW.tutor_id;
    
    IF user_role != 'TUTOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a tutor';
    END IF;
END //

-- Triggers cho feedback
CREATE TRIGGER validate_feedback_rating
BEFORE INSERT ON feedback
FOR EACH ROW
BEGIN
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;
END //

CREATE TRIGGER validate_feedback_source
BEFORE INSERT ON feedback
FOR EACH ROW
BEGIN
    IF (NEW.consultation_id IS NULL AND NEW.appointment_id IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Either consultation_id or appointment_id must be provided';
    END IF;
    
    IF (NEW.consultation_id IS NOT NULL AND NEW.appointment_id IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only one of consultation_id or appointment_id can be provided';
    END IF;
END //

CREATE TRIGGER validate_feedback_roles
BEFORE INSERT ON feedback
FOR EACH ROW
BEGIN
    DECLARE student_role VARCHAR(20);
    DECLARE tutor_role VARCHAR(20);
    
    SELECT role INTO student_role FROM users WHERE user_id = NEW.student_id;
    SELECT role INTO tutor_role FROM users WHERE user_id = NEW.tutor_id;
    
    IF student_role != 'STUDENT' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a student';
    END IF;
    
    IF tutor_role != 'TUTOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a tutor';
    END IF;
END //

-- Triggers cho progress_records
CREATE TRIGGER validate_progress_source
BEFORE INSERT ON progress_records
FOR EACH ROW
BEGIN
    IF (NEW.consultation_id IS NULL AND NEW.appointment_id IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Either consultation_id or appointment_id must be provided';
    END IF;
    
    IF (NEW.consultation_id IS NOT NULL AND NEW.appointment_id IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only one of consultation_id or appointment_id can be provided';
    END IF;
END //

CREATE TRIGGER validate_progress_roles
BEFORE INSERT ON progress_records
FOR EACH ROW
BEGIN
    DECLARE tutor_role VARCHAR(20);
    DECLARE student_role VARCHAR(20);
    
    SELECT role INTO tutor_role FROM users WHERE user_id = NEW.tutor_id;
    SELECT role INTO student_role FROM users WHERE user_id = NEW.student_id;
    
    IF tutor_role != 'TUTOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a tutor';
    END IF;
    
    IF student_role != 'STUDENT' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a student';
    END IF;
END //

-- Triggers cho curriculum_frameworks
CREATE TRIGGER validate_curriculum_framework_role
BEFORE INSERT ON curriculum_frameworks
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    
    SELECT role INTO user_role FROM users WHERE user_id = NEW.coordinator_id;
    
    IF user_role != 'COORDINATOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a coordinator';
    END IF;
END //

-- Triggers cho reports
CREATE TRIGGER validate_report_role
BEFORE INSERT ON reports
FOR EACH ROW
BEGIN
    DECLARE user_role VARCHAR(20);
    
    SELECT role INTO user_role FROM users WHERE user_id = NEW.coordinator_id;
    
    IF user_role != 'COORDINATOR' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is not a coordinator';
    END IF;
END //

-- Triggers cho matching_suggestions
CREATE TRIGGER validate_match_score
BEFORE INSERT ON matching_suggestions
FOR EACH ROW
BEGIN
    IF NEW.match_score < 0 OR NEW.match_score > 100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Match score must be between 0 and 100';
    END IF;
END //

-- Triggers cho schedule overlap
CREATE TRIGGER check_appointment_schedule_overlap 
    BEFORE INSERT ON appointments 
    FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM appointments a
        JOIN tutor_availability ta ON a.availability_id = ta.availability_id
        WHERE a.tutor_id = NEW.tutor_id
        AND a.appointment_status IN ('PENDING', 'APPROVED')
        AND ta.available_date = (SELECT available_date FROM tutor_availability WHERE availability_id = NEW.availability_id)
        AND (SELECT start_time FROM tutor_availability WHERE availability_id = NEW.availability_id) < 
            (SELECT end_time FROM tutor_availability WHERE availability_id = a.availability_id)
        AND (SELECT end_time FROM tutor_availability WHERE availability_id = NEW.availability_id) > 
            (SELECT start_time FROM tutor_availability WHERE availability_id = a.availability_id)
        AND a.appointment_id != COALESCE(NEW.appointment_id, -1)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tutor has overlapping appointment';
    END IF;
END //

CREATE TRIGGER check_consultation_schedule_overlap 
    BEFORE INSERT ON consultations 
    FOR EACH ROW
BEGIN
    -- Check against other consultations
    IF EXISTS (
        SELECT 1 FROM consultations c
        WHERE c.tutor_id = NEW.tutor_id
        AND c.status IN ('SCHEDULED', 'ONGOING')
        AND c.consultation_date = NEW.consultation_date
        AND c.start_time < NEW.end_time
        AND c.end_time > NEW.start_time
        AND c.consultation_id != COALESCE(NEW.consultation_id, -1)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tutor has overlapping consultation';
    END IF;
    
    -- Check against appointments
    IF EXISTS (
        SELECT 1 FROM appointments a
        JOIN tutor_availability ta ON a.availability_id = ta.availability_id
        WHERE a.tutor_id = NEW.tutor_id
        AND a.appointment_status IN ('PENDING', 'APPROVED')
        AND ta.available_date = NEW.consultation_date
        AND ta.start_time < NEW.end_time
        AND ta.end_time > NEW.start_time
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tutor has overlapping appointment during consultation time';
    END IF;
END //

DELIMITER ;

-- =============================================
-- VIEWS
-- =============================================

-- View cho hiệu suất tutor
CREATE VIEW tutor_performance AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.current_slots,
    u.max_slots,
    (u.max_slots - u.current_slots) as available_slots,
    COUNT(DISTINCT f.feedback_id) as total_feedbacks,
    AVG(f.rating) as average_rating,
    COUNT(DISTINCT c.consultation_id) as total_consultations,
    COUNT(DISTINCT a.appointment_id) as total_appointments,
    COUNT(DISTINCT tr.registration_id) as total_registrations,
    COUNT(DISTINCT lm.material_id) as total_materials
FROM users u
LEFT JOIN feedback f ON u.user_id = f.tutor_id
LEFT JOIN consultations c ON u.user_id = c.tutor_id
LEFT JOIN appointments a ON u.user_id = a.tutor_id
LEFT JOIN tutor_registrations tr ON u.user_id = tr.tutor_id
LEFT JOIN learning_materials lm ON u.user_id = lm.tutor_id
WHERE u.role = 'TUTOR'
GROUP BY u.user_id, u.full_name, u.email, u.current_slots, u.max_slots;

-- View cho báo cáo sử dụng hệ thống
CREATE VIEW system_usage_report AS
SELECT 
    DATE(al.created_at) as usage_date,
    u.role,
    COUNT(*) as user_activities,
    COUNT(DISTINCT al.user_id) as active_users,
    COUNT(DISTINCT CASE WHEN al.activity_type = 'LOGIN' THEN al.user_id END) as unique_logins
FROM activity_logs al
JOIN users u ON al.user_id = u.user_id
GROUP BY DATE(al.created_at), u.role;

-- View cho matching statistics
CREATE VIEW matching_statistics AS
SELECT 
    s.subject_name,
    COUNT(ms.suggestion_id) as total_suggestions,
    AVG(ms.match_score) as average_match_score,
    COUNT(CASE WHEN ms.is_accepted = true THEN 1 END) as accepted_matches,
    COUNT(CASE WHEN ms.is_accepted = false THEN 1 END) as rejected_matches
FROM matching_suggestions ms
JOIN subjects s ON ms.subject_id = s.subject_id
GROUP BY s.subject_id, s.subject_name;

-- View cho học liệu phổ biến
CREATE VIEW popular_learning_materials AS
SELECT 
    lm.material_id,
    lm.title,
    u.full_name as tutor_name,
    s.subject_name,
    lm.download_count,
    lm.view_count,
    lm.upload_date,
    RANK() OVER (ORDER BY (lm.download_count + lm.view_count) DESC) as popularity_rank
FROM learning_materials lm
JOIN users u ON lm.tutor_id = u.user_id
LEFT JOIN subjects s ON lm.subject_id = s.subject_id
WHERE lm.material_status = 'APPROVED';

-- View cho lịch hẹn sắp tới
CREATE VIEW upcoming_sessions AS
SELECT 
    'APPOINTMENT' as session_type,
    a.appointment_id as session_id,
    s.full_name as student_name,
    t.full_name as tutor_name,
    ta.available_date as session_date,
    ta.start_time,
    ta.end_time,
    a.topic,
    a.appointment_status as status
FROM appointments a
JOIN users s ON a.student_id = s.user_id
JOIN users t ON a.tutor_id = t.user_id
JOIN tutor_availability ta ON a.availability_id = ta.availability_id
WHERE ta.available_date >= CURRENT_DATE
AND a.appointment_status IN ('PENDING', 'APPROVED')

UNION ALL

SELECT 
    'CONSULTATION' as session_type,
    c.consultation_id as session_id,
    'GROUP SESSION' as student_name,
    t.full_name as tutor_name,
    c.consultation_date as session_date,
    c.start_time,
    c.end_time,
    c.title as topic,
    c.status
FROM consultations c
JOIN users t ON c.tutor_id = t.user_id
WHERE c.consultation_date >= CURRENT_DATE
AND c.status IN ('SCHEDULED', 'ONGOING')
ORDER BY session_date, start_time;

-- View để xem slot của tutor
CREATE VIEW tutor_slots_view AS
SELECT 
    u.user_id,
    u.full_name as tutor_name,
    u.email,
    u.current_slots,
    u.max_slots,
    (u.max_slots - u.current_slots) as available_slots,
    CASE 
        WHEN u.current_slots >= u.max_slots THEN 'FULL'
        WHEN u.current_slots >= u.max_slots * 0.8 THEN 'ALMOST_FULL'
        ELSE 'AVAILABLE'
    END as slot_status,
    COUNT(tr.registration_id) as pending_registrations
FROM users u
LEFT JOIN tutor_registrations tr ON u.user_id = tr.tutor_id 
    AND tr.registration_status = 'PENDING'
WHERE u.role = 'TUTOR'
GROUP BY u.user_id, u.full_name, u.email, u.current_slots, u.max_slots;

-- =============================================
-- INSERT DỮ LIỆU MẪU
-- =============================================

-- Insert users (sắp xếp lại để user_id của a.nguyenvan là 5)
INSERT INTO users (bk_net_id, email, full_name, role, faculty, major, phone_number, gpa, year_of_study, qualifications, max_slots, current_slots) VALUES
-- Tutors (ID: 1-4)
('tutor001', 'tutor001@hcmut.edu.vn', 'Nguyễn Văn A', 'TUTOR', 'Computer Science', 'Software Engineering', '0901111111', NULL, NULL, 'MSc in Computer Science, 5 years teaching experience', 15, 5),
('tutor002', 'tutor002@hcmut.edu.vn', 'Trần Thị B', 'TUTOR', 'Computer Science', 'Artificial Intelligence', '0902222222', NULL, NULL, 'PhD in AI, Google AI Residency, 3 publications', 15, 3),
('tutor003', 'tutor003@hcmut.edu.vn', 'Lê Văn C', 'TUTOR', 'Electrical Engineering', 'Electronics', '0903333333', NULL, NULL, 'BEng in Electronics, Industry expert with 8 years experience', 15, 2),
('tutor004', 'tutor004@hcmut.edu.vn', 'Phạm Thị D', 'TUTOR', 'Mechanical Engineering', 'Robotics', '0904444444', NULL, NULL, 'MEng in Robotics, Research in autonomous systems', 15, 1),

-- Student a.nguyenvan (ID: 5 - như yêu cầu)
('a.nguyenvan', 'a.Nguyenvan@hcmut.edu.vn', 'Nguyễn Văn A', 'STUDENT', 'Computer Science', 'Software Engineering', '0905555555', 3.2, 3, NULL, NULL, NULL),

-- Students khác (ID: 6-12)
('student002', 'student002@hcmut.edu.vn', 'Vũ Thị F', 'STUDENT', 'Computer Science', 'Data Science', '0906666666', 3.8, 2, NULL, NULL, NULL),
('student003', 'student003@hcmut.edu.vn', 'Đặng Văn G', 'STUDENT', 'Electrical Engineering', 'Power Systems', '0907777777', 2.9, 4, NULL, NULL, NULL),
('student004', 'student004@hcmut.edu.vn', 'Bùi Thị H', 'STUDENT', 'Mechanical Engineering', 'Automotive', '0908888888', 3.5, 3, NULL, NULL, NULL),
('student005', 'student005@hcmut.edu.vn', 'Ngô Văn I', 'STUDENT', 'Computer Science', 'Cybersecurity', '0909999999', 3.1, 2, NULL, NULL, NULL),
('student006', 'student006@hcmut.edu.vn', 'Đỗ Thị K', 'STUDENT', 'Computer Science', 'Software Engineering', '0911111111', 2.7, 4, NULL, NULL, NULL),
('student007', 'student007@hcmut.edu.vn', 'Lý Văn L', 'STUDENT', 'Computer Science', 'Artificial Intelligence', '0912222222', 3.9, 2, NULL, NULL, NULL),
('student008', 'student008@hcmut.edu.vn', 'Mai Thị M', 'STUDENT', 'Electrical Engineering', 'Electronics', '0913333333', 3.0, 3, NULL, NULL, NULL),

-- Tutor b.tranvan (ID: 13 - thêm vào cho test case)
('b.tranvan', 'b.Tranvan@hcmut.edu.vn', 'Trần Văn B', 'TUTOR', 'Computer Science', 'Software Engineering', '0914444444', NULL, NULL, 'MSc in Computer Science, 4 years teaching experience', 15, 0),

-- Coordinators (ID: 14-15)
('coord001', 'coord001@hcmut.edu.vn', 'Lê Văn N', 'COORDINATOR', 'Computer Science', NULL, '0915555555', NULL, NULL, 'Department Coordinator', NULL, NULL),
('coord002', 'coord002@hcmut.edu.vn', 'Trần Thị O', 'COORDINATOR', 'Electrical Engineering', NULL, '0916666666', NULL, NULL, 'Program Manager', NULL, NULL);

-- Insert subjects
INSERT INTO subjects (subject_code, subject_name, faculty, description, difficulty_level) VALUES
('CO3001', 'Công nghệ Phần mềm', 'Computer Science', 'Môn học về quy trình phát triển phần mềm', 'INTERMEDIATE'),
('CO3002', 'Cơ sở Dữ liệu', 'Computer Science', 'Môn học về thiết kế và quản lý cơ sở dữ liệu', 'INTERMEDIATE'),
('CO3003', 'Trí tuệ Nhân tạo', 'Computer Science', 'Môn học về AI và machine learning', 'ADVANCED'),
('CO3004', 'Mạng Máy tính', 'Computer Science', 'Môn học về mạng và truyền thông dữ liệu', 'INTERMEDIATE'),
('CO3005', 'An toàn Thông tin', 'Computer Science', 'Môn học về bảo mật và an ninh mạng', 'ADVANCED'),
('CO3006', 'Phát triển Ứng dụng Web', 'Computer Science', 'Môn học về phát triển web application', 'BEGINNER'),
('EE2001', 'Mạch Điện Tử', 'Electrical Engineering', 'Môn học về thiết kế mạch điện tử', 'INTERMEDIATE'),
('EE2002', 'Hệ Thống Điện', 'Electrical Engineering', 'Môn học về hệ thống điện và năng lượng', 'ADVANCED'),
('ME1001', 'Cơ Học Ứng Dụng', 'Mechanical Engineering', 'Môn học về cơ học và động lực học', 'INTERMEDIATE'),
('ME1002', 'Robot Công Nghiệp', 'Mechanical Engineering', 'Môn học về robot và tự động hóa', 'ADVANCED');

-- Insert tutor_expertise
INSERT INTO tutor_expertise (tutor_id, subject_id, proficiency_level, years_of_experience, hourly_rate, is_available) VALUES
-- Tutor 1 (Nguyễn Văn A)
(1, 1, 'EXPERT', 5, 25.00, true),
(1, 2, 'ADVANCED', 3, 20.00, true),
(1, 6, 'EXPERT', 4, 22.00, true),

-- Tutor 2 (Trần Thị B)
(2, 3, 'EXPERT', 4, 30.00, true),
(2, 5, 'ADVANCED', 2, 25.00, true),

-- Tutor 3 (Lê Văn C)
(3, 7, 'EXPERT', 6, 28.00, true),
(3, 8, 'ADVANCED', 4, 24.00, true),

-- Tutor 4 (Phạm Thị D)
(4, 9, 'EXPERT', 5, 26.00, true),
(4, 10, 'ADVANCED', 3, 22.00, true),

-- Tutor 13 (Trần Văn B - thêm vào)
(13, 1, 'EXPERT', 4, 23.00, true),
(13, 2, 'ADVANCED', 3, 20.00, true),
(13, 6, 'INTERMEDIATE', 2, 18.00, true);

-- Insert rooms với JSON đúng cú pháp
INSERT INTO rooms (room_code, building, floor, capacity, facilities, equipment, status) VALUES
('B1-101', 'Building B1', 1, 30, '["Projector", "Whiteboard", "AC"]', '["Computer", "Speakers"]', 'AVAILABLE'),
('B1-102', 'Building B1', 1, 40, '["Projector", "AC", "Whiteboard", "Sound System"]', '["Computer", "Document Camera"]', 'AVAILABLE'),
('B1-201', 'Building B1', 2, 25, '["Projector", "Whiteboard"]', '["Computer"]', 'AVAILABLE'),
('B2-101', 'Building B2', 1, 50, '["Projector", "AC", "Sound System", "Video Conferencing"]', '["Computer", "Multiple Displays"]', 'AVAILABLE'),
('B2-301', 'Building B2', 3, 20, '["Whiteboard"]', '[]', 'MAINTENANCE'),
('LAB-01', 'Lab Building', 1, 15, '["Computers", "Projector", "Network"]', '["15 Computers", "Server"]', 'AVAILABLE');

-- Insert tutor_availability
INSERT INTO tutor_availability (tutor_id, available_date, start_time, end_time, status) VALUES
(1, '2024-01-15', '08:00', '10:00', 'AVAILABLE'),
(1, '2024-01-15', '14:00', '16:00', 'AVAILABLE'),
(1, '2024-01-16', '09:00', '11:00', 'BOOKED'),
(1, '2024-01-17', '13:00', '15:00', 'AVAILABLE'),
(2, '2024-01-15', '10:00', '12:00', 'AVAILABLE'),
(2, '2024-01-16', '13:00', '15:00', 'AVAILABLE'),
(2, '2024-01-18', '09:00', '11:00', 'AVAILABLE'),
(3, '2024-01-17', '08:00', '10:00', 'AVAILABLE'),
(3, '2024-01-19', '14:00', '16:00', 'AVAILABLE'),
(4, '2024-01-18', '14:00', '16:00', 'AVAILABLE'),
(4, '2024-01-20', '10:00', '12:00', 'AVAILABLE'),
(13, '2024-01-15', '13:00', '15:00', 'AVAILABLE'),  -- Tutor Trần Văn B
(13, '2024-01-16', '10:00', '12:00', 'AVAILABLE'),
(13, '2024-01-17', '14:00', '16:00', 'AVAILABLE');

-- Insert tutor_registrations với match_score AI
-- LƯU Ý: KHÔNG có registration nào với status 'APPROVED' cho tutor b.tranvan (user_id 13)
-- Để test case: sinh viên a.nguyenvan (user_id 5) đăng ký tutor b.tranvan (user_id 13)
INSERT INTO tutor_registrations (student_id, tutor_id, subject_id, registration_status,  created_at) VALUES
-- Các đăng ký khác

(7, 3, 7, 'APPROVED', '2024-01-12 11:00:00');


-- Insert consultations với reminder_sent
INSERT INTO consultations (tutor_id, title, description, consultation_date, start_time, end_time, consultation_mode, max_participants, current_participants, room_id, online_link, reminder_sent, status) VALUES
(1, 'Workshop Software Engineering Best Practices', 'Chia sẻ về quy trình phát triển phần mềm, agile methodologies, và code review', '2024-01-20', '09:00', '11:00', 'OFFLINE', 20, 5, 1, NULL, false, 'SCHEDULED'),
(2, 'AI Introduction Session - Machine Learning Fundamentals', 'Giới thiệu về Trí tuệ Nhân tạo cơ bản, các thuật toán ML phổ biến', '2024-01-21', '14:00', '16:00', 'ONLINE', 30, 8, NULL, 'https://meet.google.com/abc-def-ghi', true, 'SCHEDULED'),
(3, 'Electronics Lab Tutorial - Circuit Design', 'Hướng dẫn thực hành mạch điện tử, sử dụng oscilloscope và multimeter', '2024-01-22', '08:00', '10:00', 'OFFLINE', 15, 3, 6, NULL, false, 'SCHEDULED'),
(4, 'Robotics Fundamentals - Industrial Applications', 'Kiến thức cơ bản về robot công nghiệp, programming và safety', '2024-01-23', '13:00', '15:00', 'HYBRID', 25, 6, 2, 'https://meet.google.com/xyz-uvw-rst', false, 'SCHEDULED'),
(1, 'Web Development Crash Course', 'HTML, CSS, JavaScript cơ bản cho người mới bắt đầu', '2024-01-25', '10:00', '12:00', 'ONLINE', 40, 12, NULL, 'https://meet.google.com/web-dev-2024', true, 'SCHEDULED'),
(13, 'Software Engineering for Beginners', 'Giới thiệu cơ bản về Software Engineering và các best practices', '2024-01-26', '14:00', '16:00', 'ONLINE', 25, 0, NULL, 'https://meet.google.com/se-beginner-2024', false, 'SCHEDULED');

-- Insert appointments với reminder_sent
INSERT INTO appointments (
    student_id, tutor_id, availability_id,
    topic, description,
    start_time, end_time,
    appointment_status, reminder_sent, is_cancelled,
    created_at, approved_at
) VALUES
-- Các appointments khác
(6, 2, 5,
 'Thắc mắc về Machine Learning Algorithms',
 'Cần giải thích về thuật toán SVM và ứng dụng thực tế',
 '2024-01-14 10:30:00', '2024-01-14 11:30:00',
 'PENDING', false, false,
 '2024-01-14 10:30:00', NULL),

(7, 3, 8,
 'Bài tập mạch điện tử nâng cao',
 'Gặp khó khăn với bài tập transistor và amplifier design',
 '2024-01-14 11:00:00', '2024-01-14 12:00:00',
 'APPROVED', true, false,
 '2024-01-14 11:00:00', '2024-01-14 14:00:00'),

(9, 1, 1,
 'Tư vấn học phần và lộ trình học web development',
 'Cần tư vấn chọn môn học và lộ trình trở thành full-stack developer',
 '2024-01-14 15:00:00', '2024-01-14 16:00:00',
 'PENDING', false, false,
 '2024-01-14 15:00:00', NULL),

(10, 2, 6,
 'Hướng dẫn project Computer Vision',
 'Cần hỗ trợ implement object detection model cho project',
 '2024-01-15 08:00:00', '2024-01-15 09:00:00',
 'APPROVED', false, false,
 '2024-01-15 08:00:00', '2024-01-15 09:00:00');

-- Insert consultation_registrations
INSERT INTO consultation_registrations (consultation_id, student_id, registration_status, waitlist_position, registered_at) VALUES
(1, 5, 'REGISTERED', 0, '2024-01-14 08:00:00'),
(1, 6, 'REGISTERED', 0, '2024-01-14 08:30:00'),
(1, 9, 'REGISTERED', 0, '2024-01-14 09:00:00'),
(1, 10, 'REGISTERED', 0, '2024-01-14 09:30:00'),
(1, 7, 'REGISTERED', 0, '2024-01-14 10:00:00'),
(2, 5, 'REGISTERED', 0, '2024-01-14 10:00:00'),
(2, 10, 'REGISTERED', 0, '2024-01-14 10:30:00'),
(2, 8, 'REGISTERED', 0, '2024-01-14 11:00:00'),
(3, 7, 'REGISTERED', 0, '2024-01-14 11:00:00'),
(3, 8, 'REGISTERED', 0, '2024-01-14 11:30:00'),
(4, 8, 'REGISTERED', 0, '2024-01-14 12:00:00'),
(5, 9, 'REGISTERED', 0, '2024-01-14 13:00:00'),
(5, 10, 'REGISTERED', 0, '2024-01-14 13:30:00'),
(6, 5, 'REGISTERED', 0, '2024-01-14 14:00:00');  -- Đăng ký cho consultation của tutor b.tranvan

-- Insert learning_materials với JSON đúng cú pháp
INSERT INTO learning_materials (tutor_id, title, description, file_name, file_path, file_size, file_type, subject_id, library_id, is_public, tags, material_status, upload_date, approved_date, download_count, view_count) VALUES
(1, 'Software Engineering Slides - Complete Course', 'Slide bài giảng đầy đủ môn Công nghệ Phần mềm', 'SE_Slides_Full.pdf', '/materials/se_slides_full.pdf', 5048576, 'PDF', 1, 'LIB_SE_001', true, '["software engineering", "agile", "design patterns"]', 'APPROVED', '2024-01-10 09:00:00', '2024-01-10 10:00:00', 15, 45),
(2, 'AI Lecture Notes - Machine Learning', 'Ghi chú bài giảng đầy đủ về Machine Learning', 'AI_ML_Notes.pdf', '/materials/ai_ml_notes.pdf', 3572864, 'PDF', 3, 'LIB_AI_002', true, '["artificial intelligence", "machine learning", "neural networks"]', 'APPROVED', '2024-01-11 10:00:00', '2024-01-11 11:00:00', 22, 67),
(3, 'Electronics Lab Manual - Complete Guide', 'Hướng dẫn thí nghiệm mạch điện tử đầy đủ', 'Electronics_Lab_Manual.pdf', '/materials/electronics_lab_manual.pdf', 4145728, 'PDF', 7, 'LIB_EE_003', true, '["electronics", "circuits", "lab manual"]', 'APPROVED', '2024-01-12 11:00:00', '2024-01-12 12:00:00', 8, 23),
(4, 'Robotics Exercises and Projects', 'Bài tập thực hành và project robot công nghiệp', 'Robotics_Exercises.zip', '/materials/robotics_exercises.zip', 6242880, 'ZIP', 9, NULL, false, '["robotics", "industrial", "projects"]', 'PENDING', '2024-01-13 14:00:00', NULL, 0, 5),
(1, 'Database Design Patterns and Best Practices', 'Các mẫu thiết kế database thông dụng và best practices', 'DB_Patterns_Best_Practices.pptx', '/materials/db_patterns_best_practices.pptx', 5194304, 'PPTX', 2, 'LIB_DB_004', true, '["database", "design patterns", "best practices"]', 'APPROVED', '2024-01-14 15:00:00', '2024-01-14 16:00:00', 12, 38),
(2, 'Computer Vision Tutorial with OpenCV', 'Hướng dẫn Computer Vision sử dụng OpenCV và Python', 'CV_OpenCV_Tutorial.zip', '/materials/cv_opencv_tutorial.zip', 7340032, 'ZIP', 3, NULL, true, '["computer vision", "opencv", "python"]', 'APPROVED', '2024-01-15 16:00:00', '2024-01-15 17:00:00', 18, 42),
(13, 'Software Engineering Fundamentals', 'Tài liệu cơ bản về Software Engineering cho người mới bắt đầu', 'SE_Fundamentals.pdf', '/materials/se_fundamentals.pdf', 3123456, 'PDF', 1, NULL, true, '["software engineering", "fundamentals", "beginner"]', 'APPROVED', '2024-01-14 16:00:00', '2024-01-14 17:00:00', 5, 15);

-- Insert feedback với anonymous option
INSERT INTO feedback (student_id, tutor_id, consultation_id, appointment_id, rating, comment, is_anonymous, feedback_date) VALUES
(5, 1, 1, NULL, 5, 'Buổi workshop rất bổ ích, tutor giải thích dễ hiểu và có nhiều ví dụ thực tế', false, '2024-01-20 11:30:00'),
(6, 2, 2, NULL, 4, 'Nội dung tốt nhưng hơi nhanh, cần thêm thời gian cho Q&A', false, '2024-01-21 16:30:00'),
(5, 13, 6, NULL, 5, 'Buổi consultation rất hữu ích cho người mới bắt đầu', false, '2024-01-26 16:30:00'),
(7, 3, NULL, 2, 4, 'Giải thích rõ ràng, giúp em hiểu bài tốt hơn và hoàn thành bài tập', true, '2024-01-16 11:30:00'),
(9, 1, 1, NULL, 5, 'Rất hài lòng với buổi học, kiến thức thực tế và ứng dụng được ngay', false, '2024-01-20 12:00:00'),
(10, 2, NULL, 4, 5, 'Tutor rất chuyên nghiệp, hỗ trợ kịp thời cho project của em', true, '2024-01-16 09:30:00');

-- Insert progress_records với goals tracking
INSERT INTO progress_records (tutor_id, student_id, consultation_id, appointment_id, learning_content, assessment, progress_notes, goals_set, goals_achieved, next_steps, record_date) VALUES
(1, 5, 1, NULL, 'Software Development Lifecycle, Agile Methodology, Code Review Process', 'GOOD', 'Học viên tiếp thu tốt, có thể áp dụng vào đồ án ngay', 'Hoàn thành design document, Implement core features', 'Đã hoàn thành system design, đang implement', 'Code review, testing phase', '2024-01-20 11:00:00'),
(2, 6, 2, NULL, 'Introduction to Machine Learning, Supervised Learning Algorithms', 'GOOD', 'Học viên có hiểu biết cơ bản, cần thực hành thêm', 'Understand ML algorithms, Complete assignment', 'Đã hiểu basic concepts', 'Practice with datasets, implement algorithms', '2024-01-21 16:00:00'),
(3, 7, NULL, 2, 'Transistor Circuits Analysis, Amplifier Design, Practical Applications', 'FAIR', 'Học viên cần ôn tập lại lý thuyết cơ bản', 'Complete circuit analysis, Build amplifier circuit', 'Đã hiểu transistor operation', 'Practice more problems, lab work', '2024-01-16 10:00:00'),
(2, 10, NULL, 4, 'Computer Vision, Object Detection, OpenCV Implementation', 'EXCELLENT', 'Học viên tiến bộ nhanh, có khả năng research tốt', 'Implement object detection, Optimize model', 'Đã implement basic model', 'Fine-tuning, performance optimization', '2024-01-16 09:00:00'),
(13, 5, 6, NULL, 'Software Engineering Fundamentals, Requirements Engineering, System Design', 'EXCELLENT', 'Học viên có nền tảng tốt, tiếp thu nhanh', 'Complete basic SE concepts, Start small project', 'Đã nắm vững fundamentals', 'Start implementing small project', '2024-01-26 16:00:00');

-- Insert curriculum_frameworks với coordinator_id đúng (14, 15)
INSERT INTO curriculum_frameworks (coordinator_id, title, description, topics, duration_hours, learning_objectives, required_materials, status) VALUES
(14, 'Software Engineering Foundation Program', 'Khung chương trình cơ bản cho Software Engineering từ beginner đến advanced', 'Requirements Engineering, System Design, Implementation, Testing, Deployment, Maintenance', 40, 'Nắm vững quy trình phát triển phần mềm, có thể tham gia team development', 'Laptop, IDE, Version Control System, Textbook', 'ACTIVE'),
(15, 'Electronics and Circuit Design Curriculum', 'Chương trình toàn diện về điện tử và thiết kế mạch', 'Basic Circuits, Semiconductor Devices, Analog Circuits, Digital Circuits, PCB Design', 36, 'Hiểu và phân tích được mạch điện, thiết kế mạch cơ bản', 'Multimeter, Oscilloscope, Breadboard, Electronic Components', 'ACTIVE'),
(14, 'AI/ML Comprehensive Learning Program', 'Chương trình học AI/ML từ cơ bản đến nâng cao', 'ML Algorithms, Deep Learning, Computer Vision, NLP, Model Evaluation', 32, 'Hiểu và áp dụng được các thuật toán ML, build AI applications', 'Python, Jupyter Notebook, ML Libraries, Datasets', 'ACTIVE'),
(15, 'Robotics and Automation Foundation', 'Chương trình nền tảng về robotics và automation', 'Robot Kinematics, Control Systems, Sensors, Actuators, Programming', 28, 'Hiểu nguyên lý robot, lập trình robot cơ bản', 'Robot Kit, Programming Software, Simulation Tools', 'ACTIVE');

-- Insert reports với coordinator_id đúng (14, 15)
INSERT INTO reports (coordinator_id, report_type, report_title, report_period, generated_date, file_path, file_format, status, sent_date) VALUES
(14, 'TUTOR_PERFORMANCE', 'Báo cáo hiệu suất Tutor tháng 1/2024', 'MONTHLY', '2024-01-31 17:00:00', '/reports/tutor_perf_jan2024.pdf', 'PDF', 'SENT', '2024-01-31 18:00:00'),
(15, 'SYSTEM_USAGE', 'Báo cáo sử dụng hệ thống quý 1/2024', 'QUARTERLY', '2024-03-31 16:00:00', '/reports/system_usage_q1_2024.xlsx', 'EXCEL', 'GENERATED', NULL),
(14, 'STUDENT_FEEDBACK', 'Tổng hợp phản hồi sinh viên tháng 1/2024', 'MONTHLY', '2024-01-31 15:00:00', '/reports/feedback_jan2024.pdf', 'PDF', 'SENT', '2024-01-31 16:30:00'),
(15, 'COURSE_COMPLETION', 'Báo cáo hoàn thành khóa học học kỳ 1/2024', 'SEMESTER', '2024-06-30 14:00:00', '/reports/course_completion_sem1_2024.pdf', 'PDF', 'GENERATED', NULL);

-- Insert notifications với đa dạng types
INSERT INTO notifications (user_id, title, message, notification_type, is_read, priority, created_at, related_entity_type, related_entity_id, expires_at) VALUES
(5, 'Đăng ký Tutor thành công', 'Đăng ký học với tutor Trần Văn B đã được gửi. Vui lòng chờ phản hồi.', 'REGISTRATION', false, 'MEDIUM', '2024-01-14 09:05:00', 'TUTOR_REGISTRATION', 5, '2024-01-17 09:05:00'),
(13, 'Có yêu cầu đăng ký Tutor mới', 'Sinh viên Nguyễn Văn A muốn đăng ký học với bạn. Vui lòng xem xét và phản hồi.', 'REGISTRATION', false, 'MEDIUM', '2024-01-14 09:05:00', 'TUTOR_REGISTRATION', 5, '2024-01-15 09:05:00'),
(6, 'Yêu cầu đặt lịch chờ duyệt', 'Yêu cầu đặt lịch với tutor Trần Thị B đang chờ duyệt. Vui lòng chờ phản hồi trong 24h.', 'APPOINTMENT', false, 'LOW', '2024-01-14 10:30:00', 'APPOINTMENT', 1, '2024-01-15 10:30:00'),
(7, 'Lịch hẹn đã được duyệt', 'Lịch hẹn với tutor Lê Văn C đã được duyệt. Thời gian: 14/01/2024, 11:00-12:00.', 'APPOINTMENT', true, 'MEDIUM', '2024-01-14 14:00:00', 'APPOINTMENT', 2, '2024-01-14 12:00:00'),
(1, 'Có yêu cầu đặt lịch mới', 'Sinh viên Ngô Văn I muốn đặt lịch tư vấn học phần. Vui lòng xem xét và phản hồi.', 'APPOINTMENT', false, 'MEDIUM', '2024-01-14 15:00:00', 'APPOINTMENT', 3, '2024-01-16 15:00:00'),
(9, 'Nhắc lịch buổi workshop', 'Buổi workshop Software Engineering sẽ diễn ra vào 20/01/2024, 09:00-11:00. Đừng quên tham gia!', 'REMINDER', false, 'HIGH', '2024-01-19 18:00:00', 'CONSULTATION', 1, '2024-01-20 11:00:00'),
(2, 'Tài liệu mới đã được duyệt', 'Tài liệu "AI Lecture Notes" của bạn đã được duyệt và công bố cho sinh viên.', 'MATERIAL', true, 'LOW', '2024-01-11 11:00:00', 'LEARNING_MATERIAL', 2, '2024-01-18 11:00:00');

-- Insert activity_logs
INSERT INTO activity_logs (user_id, activity_type, activity_description, ip_address, user_agent, created_at) VALUES
(5, 'LOGIN', 'User logged into system successfully', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-01-14 08:00:00'),
(5, 'TUTOR_REGISTRATION', 'Student registered for tutor Trần Văn B for Software Engineering', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2024-01-14 09:00:00'),
(1, 'MATERIAL_UPLOAD', 'Tutor uploaded new learning material: Software Engineering Slides', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '2024-01-14 09:00:00'),
(6, 'APPOINTMENT_REQUEST', 'Student requested new appointment with tutor Trần Thị B', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-01-14 10:30:00'),
(14, 'REPORT_GENERATION', 'Coordinator generated monthly tutor performance report', '192.168.1.103', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '2024-01-14 11:00:00'),
(7, 'CONSULTATION_REGISTRATION', 'Student registered for Electronics Lab Tutorial consultation', '192.168.1.104', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', '2024-01-14 12:00:00'),
(13, 'LOGIN', 'Tutor logged into system successfully', '192.168.1.107', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', '2024-01-14 13:00:00'),
(9, 'FEEDBACK_SUBMISSION', 'Student submitted feedback for Software Engineering workshop', '192.168.1.105', 'Mozilla/5.0 (Android 13; Mobile) AppleWebKit/537.36', '2024-01-20 11:30:00'),
(2, 'APPOINTMENT_APPROVAL', 'Tutor approved appointment request from student', '192.168.1.106', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0', '2024-01-15 09:00:00');

-- Insert matching_suggestions với JSON đúng cú pháp
INSERT INTO matching_suggestions (student_id, tutor_id, subject_id, match_score, match_reasons, is_accepted, suggested_at, expires_at) VALUES
-- TEST CASE: suggestion cho sinh viên a.nguyenvan (5) và tutor b.tranvan (13)
(5, 13, 1, 85.50, '["Same faculty", "High tutor expertise", "Tutor has available slots", "Student needs help with SE"]', NULL, '2024-01-13 08:00:00', '2024-01-20 08:00:00'),
(6, 2, 3, 92.00, '["Perfect subject match", "Tutor has publications", "Student high GPA"]', NULL, '2024-01-10 09:00:00', '2024-01-17 09:00:00'),
(7, 3, 7, 78.50, '["Faculty alignment", "Tutor industry experience", "Moderate match"]', true, '2024-01-11 10:00:00', '2024-01-18 10:00:00'),
(9, 1, 6, 88.00, '["Web development focus", "Tutor expertise match", "Student interest"]', NULL, '2024-01-13 11:00:00', '2024-01-20 11:00:00'),
(10, 2, 3, 95.50, '["Excellent GPA match", "Research interest alignment", "High tutor rating"]', true, '2024-01-14 12:00:00', '2024-01-21 12:00:00'),
(8, 4, 9, 65.00, '["Different faculty", "Basic match", "Availability limited"]', false, '2024-01-12 13:00:00', '2024-01-19 13:00:00');

-- Insert payments (nếu có tính phí)
INSERT INTO payments (student_id, tutor_id, appointment_id, consultation_id, amount, currency, payment_method, payment_status, transaction_id, payment_date) VALUES
(7, 3, 2, NULL, 56.00, 'VND', 'CREDIT_CARD', 'COMPLETED', 'TXN_00123457', '2024-01-14 15:00:00'),
(10, 2, 4, NULL, 60.00, 'VND', 'E_WALLET', 'COMPLETED', 'TXN_00123458', '2024-01-15 10:00:00'),
(9, 1, NULL, 1, 25.00, 'VND', 'BANK_TRANSFER', 'PENDING', NULL, NULL);

-- =============================================
-- KIỂM TRA DỮ LIỆU
-- =============================================

-- Kiểm tra users
SELECT user_id, bk_net_id, full_name, role, faculty, current_slots, max_slots 
FROM users 
ORDER BY user_id;

-- Kiểm tra tutor_registrations của sinh viên a.nguyenvan (user_id 5)
SELECT 
    tr.registration_id,
    s.full_name as student_name,
    t.full_name as tutor_name,
    sub.subject_name,
    tr.registration_status,
    tr.created_at
FROM tutor_registrations tr
JOIN users s ON tr.student_id = s.user_id
JOIN users t ON tr.tutor_id = t.user_id
JOIN subjects sub ON tr.subject_id = sub.subject_id
WHERE s.bk_net_id = 'a.nguyenvan' 
ORDER BY tr.created_at DESC;

-- Kiểm tra slot của tutor b.tranvan (user_id 13)
SELECT 
    user_id,
    full_name,
    current_slots,
    max_slots,
    (max_slots - current_slots) as available_slots
FROM users 
WHERE bk_net_id = 'b.tranvan';

-- Kiểm tra tất cả tutors và slot của họ
SELECT 
    user_id,
    full_name,
    email,
    current_slots,
    max_slots,
    (max_slots - current_slots) as available_slots,
    CASE 
        WHEN current_slots >= max_slots THEN 'FULL'
        WHEN current_slots >= max_slots * 0.8 THEN 'ALMOST_FULL'
        ELSE 'AVAILABLE'
    END as slot_status
FROM users 
WHERE role = 'TUTOR'
ORDER BY user_id;

-- Test trigger: Thử đăng ký khi tutor đã full slot
-- Trước tiên, cập nhật tutor b.tranvan thành full slot
UPDATE users SET current_slots = max_slots WHERE user_id = 13;

-- Thử insert một registration mới (sẽ bị trigger chặn)
-- INSERT INTO tutor_registrations (student_id, tutor_id, subject_id, registration_status, request_message, match_score, created_at, expires_at) 
-- VALUES (6, 13, 1, 'PENDING', 'Test registration when tutor full', 80.00, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));

-- Reset lại slot của tutor b.tranvan
UPDATE users SET current_slots = 0 WHERE user_id = 13;

-- Kiểm tra view tutor_slots_view
SELECT * FROM tutor_slots_view ORDER BY tutor_name;

-- Kiểm tra view tutor_performance
SELECT * FROM tutor_performance ORDER BY user_id;

select * from tutor_registrations;