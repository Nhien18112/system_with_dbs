package com.project.happy.service.tutor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * MatchingEngine now queries the database for tutor suggestions using JdbcTemplate.
 * It searches `subjects`, `tutor_expertise`, `users` and aggregates rating and availability.
 */
@Component
public class MatchingEngine {

    public static record TutorSuggestion(String tutorId, String name, double rating, int availableSlots) {}

    private final JdbcTemplate jdbc;

    @Autowired
    public MatchingEngine(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<TutorSuggestion> suggestTutors(String subject) {
        if (subject == null || subject.trim().isEmpty()) return List.of();

        String sql = """
                SELECT u.user_id AS tutor_id,
                       u.full_name AS name,
                       COALESCE(AVG(f.rating), 4.5) AS rating,
                       SUM(CASE WHEN te.is_available = 1 THEN 1 ELSE 0 END) AS available_slots
                FROM users u
                JOIN tutor_expertise te ON te.tutor_id = u.user_id
                JOIN subjects s ON s.subject_id = te.subject_id
                LEFT JOIN feedback f ON f.tutor_id = u.user_id
                WHERE u.role = 'TUTOR' AND s.subject_name LIKE ?
                GROUP BY u.user_id, u.full_name
                ORDER BY rating DESC
                LIMIT 20
                """;

        String pattern = "%" + subject.trim() + "%";

        return jdbc.query(sql, new Object[]{pattern}, (rs, rowNum) ->
                new TutorSuggestion(
                        String.valueOf(rs.getInt("tutor_id")),
                        rs.getString("name"),
                        rs.getDouble("rating"),
                        rs.getInt("available_slots")
                )
        );
    }
}
