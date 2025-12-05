# Tóm tắt sửa chữa Tutor Registration System

## 1. THAY ĐỔI DATABASE SCHEMA

### Xóa các cột không cần thiết từ bảng `tutor_registrations`:
- ❌ `request_message` - Không cần lưu message từ request
- ❌ `reason_for_rejection` - Không cần lưu lý do từ chối
- ❌ `match_score` - Không cần AI matching score
- ❌ `expires_at` - Không cần hết hạn

### Schema mới (đơn giản hơn):
```sql
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
```

## 2. THAY ĐỔI CODE BACKEND

### Entity `TutorRegistrationEntity.java`:
- ❌ Xóa field `expiresAt`
- ❌ Xóa field `reasonForRejection`
- ✅ Giữ lại: `id`, `studentId`, `tutorId`, `subjectId`, `status`, `requestTime`, `approvedAt`

### Service `TutorRegistrationService.java`:
- ✅ `createRequest()` - Tạo registration mới với status PENDING (không set expires_at)
- ✅ `approveById()` - Tutor duyệt → set status = APPROVED, set approvedAt = now
- ✅ `rejectById()` - Tutor từ chối → set status = REJECTED (không lưu reason)
- ✅ Giữ lại các method query: `getPendingRegistrations()`, `getApprovedStudents()`

### Controller `TutorRegistrationController.java`:
- ✅ DTO mới: `RegistrationDto` chỉ chứa: `id`, `studentId`, `tutorId`, `subjectId`, `registrationStatus`, `createdAt`, `approvedAt`
- ❌ Xóa `reasonForRejection` khỏi response

## 3. FLOW ĐĂNG KÝ TUTOR (VERIFIED - ĐÚNG)

### Flow hiện tại tuân theo đúng yêu cầu:

#### Step 1: Sinh viên chọn môn
```
GET /api/subjects → Danh sách môn học
Frontend: RegisterTutor.jsx - Select subject
```

#### Step 2: Hệ thống tìm tutor phù hợp
```
GET /api/tutor-registration/suggest?subject={subjectName}
→ Danh sách tutor có expertise về môn đó (từ MatchingEngine)
```

#### Step 3: Sinh viên chọn tutor và đăng ký
```
POST /api/tutor-registration/register-tutor
{
  "studentId": 1,
  "subjectId": 5,
  "tutorId": 3
}
Response: {
  "registrationId": 123,
  "status": "PENDING"
}
```
- Tạo bản ghi mới với status = PENDING
- Chủ động: Chỉ tutor được đăng ký trên web mới được thêm vào

#### Step 4: Tutor xem & duyệt
```
GET /api/tutor-registration/pending-registrations?tutorId=3
→ Danh sách pending requests từ sinh viên

POST /api/tutor-registration/{registrationId}/approve
{
  "tutorId": 3
}
→ Cập nhật status = APPROVED, approved_at = now
```

#### Step 5: Registration được lưu
- Bản ghi vẫn trong bảng `tutor_registrations` với status = APPROVED
- ✅ Không tạo bản ghi riêng: Chỉ cập nhật status existing record

### Kiểm tra thêm:
```
GET /api/tutor-registration/approved-students?tutorId=3
→ Danh sách sinh viên đã được duyệt của tutor

GET /api/tutor-registration/student/{studentId}/my-tutor
→ Lấy tutor được duyệt của sinh viên
```

## 4. BUILD STATUS

✅ **BUILD SUCCESS** - Không có lỗi compile
- 67 source files compiled successfully
- Warning: MatchingEngine.java uses deprecated API (không ảnh hưởng functionality)

## 5. LOGIC KIỂM CHỨNG

| Yêu cầu | Status | Chi tiết |
|---------|--------|---------|
| Chỉ cần cột: student_id, tutor_id, subject_id, status, created_at, approved_at | ✅ | Xóa: request_message, reason_for_rejection, match_score, expires_at |
| Sinh viên chọn môn → thấy tutor | ✅ | `/suggest` endpoint trả về danh sách tutor |
| Đăng ký tutor → PENDING | ✅ | `createRequest()` set status = PENDING |
| Tutor duyệt → APPROVED | ✅ | `approveById()` set status = APPROVED |
| Chỉ lưu tutor web (không có automatic trigger) | ✅ | Không có scheduler tự động thêm bản ghi |
| Không cần reason_for_rejection | ✅ | Xóa khỏi entity, service, controller |

## 6. ENDPOINT TÓMLƯỢC

```
POST   /api/tutor-registration/register-tutor          (Sinh viên đăng ký)
GET    /api/tutor-registration/suggest?subject=...    (Tìm tutor phù hợp)
POST   /api/tutor-registration/{id}/approve           (Tutor duyệt)
POST   /api/tutor-registration/{id}/reject            (Tutor từ chối)
GET    /api/tutor-registration/pending-registrations  (Tutor xem pending)
GET    /api/tutor-registration/approved-students      (Tutor xem đã duyệt)
GET    /api/tutor-registration/student/{id}/my-tutor  (Sinh viên xem tutor đã duyệt)
```

---
**Kết luận:** Logic đăng ký tutor hiện tại **ĐÃ ĐÚNG** theo yêu cầu. Tất cả cột thừa và logic không cần thiết đã được xóa. ✅
