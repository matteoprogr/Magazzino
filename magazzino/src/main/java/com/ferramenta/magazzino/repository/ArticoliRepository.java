package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Articolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticoliRepository  extends JpaRepository<Articolo, Long>, ArticoliRepositoryCustom {

    Articolo findById(int id);


    @Query(value = """
   SELECT * FROM articolo
   WHERE is_active = 1
    AND(:nome IS NULL OR LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')))
    AND(:categoria IS NULL OR LOWER(categoria) LIKE(CONCAT('%', :categoria, '%')))
    AND(:ubicazione IS NULL OR LOWER(ubicazione) LIKE(CONCAT('%', :ubicazione, '%')))
    AND(:codice IS NULL OR LOWER(codice) LIKE(CONCAT('%', :codice, '%')))
    AND((:minQuantita IS NULL OR quantita >= :minQuantita)
    AND(:maxQuantita IS NULL OR quantita <= :maxQuantita))
    AND((:minCosto IS NULL OR costo >= :minCosto)
    AND(:maxCosto IS NULL OR costo <= :maxCosto))
    AND ((:da IS NULL OR data_inserimento >= :da)
    AND (:a IS NULL OR data_inserimento <= :a))
    AND ((:daM IS NULL OR data_modifica >= :daM)
    AND (:aM IS NULL OR data_modifica <= :aM))
   ORDER BY
    CASE WHEN :orderBy = 'richieste' THEN richieste END DESC,
    CASE WHEN :orderBy = 'costo' THEN costo END DESC,
    CASE WHEN :orderBy = 'quantita' THEN quantita END DESC,
    CASE WHEN :orderBy = 'nome' THEN nome END ASC
   LIMIT :limit OFFSET :offset
   """, nativeQuery = true)
    List<Articolo> searchArticoli(
            @Param("nome") String nome,
            @Param("categoria") String categoria,
            @Param("ubicazione") String ubicazione,
            @Param("codice") String codice,
            @Param("da") String da,
            @Param("a") String a,
            @Param("daM") String daM,
            @Param("aM") String aM,
            @Param("minQuantita") Integer minQuantita,
            @Param("maxQuantita") Integer maxQuantita,
            @Param("minCosto") Integer minCosto,
            @Param("maxCosto") Integer maxCosto,
            @Param("limit") int limit,
            @Param("offset") int offset,
            @Param("orderBy") String orderBy
    );

    @Query(value = """
            SELECT * FROM articolo
            WHERE last_month_record = 1
             AND is_active = 1
            """, nativeQuery = true)
    List<Articolo> searchArticoloGraficoActive();

    @Query(value = """
            SELECT * FROM articolo
            WHERE last_month_record = 1
             AND strftime('%Y', data_modifica) = :anno
            """, nativeQuery = true)
    List<Articolo> searchArticoloGrafico(
            @Param("anno") String anno
    );


    @Query(value = """
   SELECT COUNT(*) FROM articolo
   WHERE is_active = 1
    AND (:nome IS NULL OR LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')))
    AND(:categoria IS NULL OR LOWER(categoria) LIKE(CONCAT('%', :categoria, '%')))
    AND(:ubicazione IS NULL OR LOWER(ubicazione) LIKE(CONCAT('%', :ubicazione, '%')))
    AND(:codice IS NULL OR LOWER(codice) LIKE(CONCAT('%', :codice, '%')))
    AND((:minQuantita IS NULL OR quantita >= :minQuantita)
    AND(:maxQuantita IS NULL OR quantita <= :maxQuantita))
    AND((:minCosto IS NULL OR costo >= :minCosto)
    AND(:maxCosto IS NULL OR costo <= :maxCosto))
    AND ((:da IS NULL OR data_inserimento >= :da)
    AND (:a IS NULL OR data_inserimento <= :a))
    AND ((:daM IS NULL OR data_modifica >= :daM)
    AND (:aM IS NULL OR data_modifica <= :aM))
   """, nativeQuery = true)
    long countArticoli(
            @Param("nome") String nome,
            @Param("categoria") String categoria,
            @Param("ubicazione") String ubicazione,
            @Param("codice") String codice,
            @Param("da") String da,
            @Param("a") String a,
            @Param("daM") String daM,
            @Param("aM") String aM,
            @Param("minQuantita") Integer minQuantita,
            @Param("maxQuantita") Integer maxQuantita,
            @Param("minCosto") Integer minCosto,
            @Param("maxCosto") Integer maxCosto
    );


    @Modifying
    @Query(value = "UPDATE articolo SET categoria = :newName WHERE categoria = :oldCategoria", nativeQuery = true)
    int updateCategoriainArticoli(
            @Param("oldCategoria") String oldCategoria,
            @Param("newName") String newName);


    @Modifying
    @Query(value = "UPDATE articolo SET ubicazione = :newName WHERE ubicazione = :oldUbicazione", nativeQuery = true)
    int updateUbicazioneinArticoli(
            @Param("oldUbicazione") String oldUbicazione,
            @Param("newName") String newName);

    @Modifying
    @Query(value = """
    UPDATE articolo
    SET last_month_record = :lastMonthRecord
    WHERE id_articolo = :idArticolo
      AND strftime('%Y-%m', data_modifica) = :yearMonth
      AND last_month_record <> :lastMonthRecord
    """, nativeQuery = true)
    int updateLastMonthRecordInArticoli(
            @Param("idArticolo") String idArticolo,
            @Param("yearMonth") String yearMonth,
            @Param("lastMonthRecord") Boolean lastMonthRecord
    );

    @Query(value = """
    SELECT * FROM articolo
    WHERE last_month_record = 1
      AND strftime('%Y-%m', data_modifica) = :yearMonth
      AND id_articolo = :idArticolo
      AND categoria = :categoria
    """, nativeQuery = true)
    Articolo getRecordByidArticolAndYearMonthAndCategoria(
            @Param("idArticolo") String idArticolo,
            @Param("yearMonth") String yearMonth,
            @Param("categoria") String categoria
    );

    @Modifying
    @Query(value = """
    UPDATE articolo
    SET is_active = :isActive
    WHERE id_articolo = :idArticolo
        AND is_active <> :isActive
    """, nativeQuery = true)
    int updateIsActiveInArticoli(
            @Param("idArticolo") String idArticolo,
            @Param("isActive") Boolean isActive
    );



    @Query(value = "SELECT id FROM Articolo ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Integer findLastId();

    List<Articolo> findByCategoria(String categoria);
}
