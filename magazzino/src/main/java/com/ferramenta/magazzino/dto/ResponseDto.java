package com.ferramenta.magazzino.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@AllArgsConstructor
public class ResponseDto {

    private String messaggio;
    private HttpStatus status;
}
