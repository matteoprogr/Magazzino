package com.ferramenta.magazzino.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Articolo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nome;
    private int quantita;
    private String codice;
    private String categoria;
}
