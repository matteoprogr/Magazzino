package com.ferramenta.magazzino.dto;

import lombok.Data;

@Data
public class MerceDto {

    private int entrata;
    private int uscita;
    private String mese;
    private String anno;
}
