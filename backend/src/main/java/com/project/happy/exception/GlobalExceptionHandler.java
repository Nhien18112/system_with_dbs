package com.project.happy.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.SQLException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({DataIntegrityViolationException.class, DataAccessException.class})
    public ResponseEntity<Object> handleDataAccess(Exception ex) {
        Throwable root = ex.getCause();
        if (root instanceof SQLException) {
            SQLException sql = (SQLException) root;
            String sqlState = sql.getSQLState();
            String message = sql.getMessage();
            // MySQL triggers use SQLSTATE '45000' for SIGNAL
            if (sqlState != null && sqlState.startsWith("45")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
            }
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }

    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Object> handleSql(SQLException ex) {
        String sqlState = ex.getSQLState();
        if (sqlState != null && sqlState.startsWith("45")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}
