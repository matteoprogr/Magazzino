package com.ferramenta.magazzino.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CategoriaDto {

    @NotBlank(message = "La categoria non può essere vuota")
    @Size(min = 3, max = 30, message = "La categoria deve avere almeno 3 caratteri e massimo 30")
    @Pattern(regexp = "^[^\\[\\]]*$", message = "La categoria non può contenere i caratteri [ o ]")
    private String nome;

    private List<String> sottoCategorie;
}
