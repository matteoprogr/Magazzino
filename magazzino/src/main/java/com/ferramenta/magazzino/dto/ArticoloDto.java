package com.ferramenta.magazzino.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ArticoloDto {

    private int id;

    private String idArticolo;

    @NotBlank(message = "il nome non puo essere vuoto")
    @Size(min  = 3, max = 100, message = "Il nome deve avere almeno 3 caratteri e massimo 100")
    private String nome;

    @Min(value = 0, message = "La quantità non puo essere negativa")
    private int quantita;

    @Min(value = 0, message = "Il costo non puo essere negativo")
    private double costo;

    private double costoUnita;

    private String codice;

    @NotBlank(message = "La categoria non può essere vuota")
    @Size(min = 3, max = 30, message = "La categoria deve avere almeno 3 caratteri e massimo 30")
    private String categoria;

    private List<String> sottoCategorie;

    @NotBlank(message = "L'ubicazione non può essere vuota")
    @Size(min = 3, max = 30, message = "L'ubicazione deve avere almeno 3 caratteri e massimo 30")
    private String ubicazione;

    private String dataInserimento;
    private String dataModifica;

    private int richieste;

    private boolean updatedQuantita;
    private boolean updatedCosto;
}
