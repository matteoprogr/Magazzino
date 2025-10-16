package com.ferramenta.magazzino.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Ubicazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String nome;
}
