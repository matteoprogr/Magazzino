package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Merce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MerceRepository extends JpaRepository<Merce, Integer> {
    Merce findByMeseAndAnnoAndIdArticolo(String mese,String anno, String idArticolo);

    List<Merce> findByAnno(String anno);

    @Transactional
    @Modifying
    void deleteByIdArticolo(String idArticolo);
}
