package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Merce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MerceRepository extends JpaRepository<Merce, Integer> {
    Merce findByMeseAndAnno(String mese,String anno);
}
