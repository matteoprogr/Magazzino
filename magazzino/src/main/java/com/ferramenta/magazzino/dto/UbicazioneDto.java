package com.ferramenta.magazzino.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UbicazioneDto {

    @NotBlank(message = "L'ubicazione non può essere vuota")
    @Size(min = 3, max = 30, message = "L'ubicazione deve avere almeno 3 caratteri e massimo 30")
    private String nome;
}
