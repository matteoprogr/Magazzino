package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Ubicazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UbicazioneRepository extends JpaRepository<Ubicazione, Integer> {
    Ubicazione findByNome(String categoria);


    @Query(value = """
   SELECT * FROM ubicazione
   WHERE (:nome IS NULL OR LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')))
    LIMIT :limit OFFSET :offset
   """, nativeQuery = true)
    List<Ubicazione> searchUbicazione(
            @Param("nome") String nome,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
   SELECT COUNT(*) FROM ubicazione
   WHERE (:nome IS NULL OR LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')))
   """, nativeQuery = true)
    long countUbicazione(
            @Param("nome") String nome
    );
}
