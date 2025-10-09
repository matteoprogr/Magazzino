package com.ferramenta.magazzino.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ArticoloDto {

    private int id;

    @NotBlank(message = "il nome non puo essere vuoto")
    @Size(min  = 3, max = 50, message = "il nome deve almeno 3 caratteri e massimo 50")
    private String nome;

    @Min(value = 0, message = "La quantità non puo essere negativa")
    private int quantita;

    private String codice;

    @NotBlank(message = "La categoria non può essere vuota")
    @Size(min = 3, max = 30, message = "La categoria deve avere almeno 3 caratteri e massimo 30")
    private String categoria;
}
