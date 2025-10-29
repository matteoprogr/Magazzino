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


    @Modifying
    @Query(value = "UPDATE articolo SET categoria = :newName WHERE categoria = :oldCategoria", nativeQuery = true)
    int updateCategoriainArticoli(
            @Param("oldCategoria") String oldCategoria,
            @Param("newName") String newName);

    @Query(value = "SELECT * FROM articolo WHERE sotto_categorie LIKE '%' || :sottoCategoria || '%'",nativeQuery = true)
    List<Articolo> findBySottoCategoria(@Param("sottoCategoria") String sottoCategoria);

    @Modifying
    @Query(value = "UPDATE articolo SET sotto_categorie = '[]' WHERE LOWER(categoria) = LOWER(:categoria)", nativeQuery = true)
    int clearSottoCategoriainArticoli(@Param("categoria") String categoria);


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
