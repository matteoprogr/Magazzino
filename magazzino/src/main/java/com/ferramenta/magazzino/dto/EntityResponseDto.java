package com.ferramenta.magazzino.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class EntityResponseDto {
    private List<?> entity;
    private long count;
}
