package com.ferramenta.magazzino.entity;

import com.ferramenta.magazzino.config.StringListConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String nome;

    @Convert(converter = StringListConverter.class)
    @Column(name = "sotto_categorie")
    private List<String> sottoCategorie;
}
