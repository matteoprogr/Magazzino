package com.ferramenta.magazzino.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class EntityResponseDto {
    private List<?> entity;
    private long count;
}
