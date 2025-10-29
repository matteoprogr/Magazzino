package com.ferramenta.magazzino.entity;

import com.ferramenta.magazzino.config.StringListConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;


@Entity
@Data
public class Articolo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String idArticolo;

    private String nome;
    private int quantita;
    private double costo;
    private double costoUnita;
    private double valore;
    private int richieste;

    private String codice;
    private String categoria;

    @Convert(converter = StringListConverter.class)
    @Column(name = "sotto_categorie")
    private List<String> sottoCategorie;
    private String ubicazione;

    private String dataInserimento;
    private String dataModifica;
    private boolean isActive;
    private boolean lastMonthRecord;
}
