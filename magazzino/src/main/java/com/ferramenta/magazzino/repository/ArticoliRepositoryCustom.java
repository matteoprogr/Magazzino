package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Articolo;

import java.util.List;


public interface ArticoliRepositoryCustom {

    List<Articolo> searchArticoliEntity(
            String nome,
            String categoria,
            String ubicazione,
            String codice,
            String da,
            String a,
            String daM,
            String aM,
            Integer minQuantita,
            Integer maxQuantita,
            Integer minCosto,
            Integer maxCosto,
            int limit,
            int offset,
            String orderBy,
            String direction
    );
}
