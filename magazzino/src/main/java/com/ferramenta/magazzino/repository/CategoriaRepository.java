package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    Categoria findByNome(String categoria);


    @Query(value = """
   SELECT * FROM categoria
   WHERE (:nome IS NULL OR LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')))
    LIMIT :limit OFFSET :offset
   """, nativeQuery = true)
    List<Categoria> searchCategorie(
            @Param("nome") String nome,
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query(value = """
   SELECT COUNT(*) FROM categoria
   WHERE (:nome IS NULL OR LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%')))
   """, nativeQuery = true)
    long countCategorie(
            @Param("nome") String nome
    );
}

