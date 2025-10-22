package com.ferramenta.magazzino.entity;

import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
public class Articolo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(unique = true)
    private String idArticolo;

    private String nome;
    private int quantita;
    private double costo;
    private double costoUnita;
    private double valore;
    private int richieste;

    @Column(unique = true)
    private String codice;
    private String categoria;
    private String ubicazione;

    private String dataInserimento;
    private String dataModifica;
    private boolean isActive;
    private boolean lastMonthRecord;
}
