package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Articolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticoliRepository  extends JpaRepository<Articolo, Long> {

    @Query(value = """
   SELECT * FROM articolo
   WHERE (:nome IS NULL OR LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')))
    AND(:categoria IS NULL OR LOWER(categoria) LIKE(CONCAT('%', :categoria, '%')))
    AND(:ubicazione IS NULL OR LOWER(ubicazione) LIKE(CONCAT('%', :ubicazione, '%')))
    AND(:codice IS NULL OR LOWER(codice) LIKE(CONCAT('%', :codice, '%')))
    AND((:minQuantita IS NULL OR quantita >= :minQuantita)
    AND(:maxQuantita IS NULL OR quantita <= :maxQuantita))
    AND((:minCosto IS NULL OR quantita >= :minCosto)
    AND(:maxCosto IS NULL OR quantita <= :maxCosto))
    AND ((:da IS NULL OR data_inserimento >= :da)
    AND (:a IS NULL OR data_inserimento <= :a))
    LIMIT :limit OFFSET :offset
   """, nativeQuery = true)
    List<Articolo> searchArticoli(
            @Param("nome") String nome,
            @Param("categoria") String categoria,
            @Param("ubicazione") String ubicazione,
            @Param("codice") String codice,
            @Param("da") String da,
            @Param("a") String a,
            @Param("minQuantita") Integer minQuantita,
            @Param("maxQuantita") Integer maxQuantita,
            @Param("minCosto") Integer minCosto,
            @Param("maxCosto") Integer maxCosto,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
   SELECT COUNT(*) FROM articolo
   WHERE (:nome IS NULL OR LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')))
     AND (:categoria IS NULL OR LOWER(categoria) LIKE LOWER(CONCAT('%', :categoria, '%')))
     AND (:codice IS NULL OR LOWER(codice) LIKE LOWER(CONCAT('%', :codice, '%')))
     AND ((:minQuantita IS NULL OR quantita >= :minQuantita)
         AND (:maxQuantita IS NULL OR quantita <= :maxQuantita))
   """, nativeQuery = true)
    long countArticoli(
            @Param("nome") String nome,
            @Param("categoria") String categoria,
            @Param("codice") String codice,
            @Param("minQuantita") Integer minQuantita,
            @Param("maxQuantita") Integer maxQuantita
    );


    @Modifying
    @Query(value = "UPDATE articolo SET categoria = :newName WHERE categoria = :oldCategoria", nativeQuery = true)
    int updateCategoriainArticoli(
            @Param("oldCategoria") String oldCategoria,
            @Param("newName") String newName);


    @Query(value = "SELECT id FROM Articolo ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Integer findLastId();

    List<Articolo> findByCategoria(String categoria);
}
