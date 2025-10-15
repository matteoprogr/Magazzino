package com.ferramenta.magazzino.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("message", String.join(", ", errors));
        response.put("status", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(AlreadyExistsException ex) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", String.join(", ", ex.getMessage()));
        response.put("status", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.badRequest().body(response);
    }
}

