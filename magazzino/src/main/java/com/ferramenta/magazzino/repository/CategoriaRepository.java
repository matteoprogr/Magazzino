package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    Categoria findByNome(String categoria);

    List<Categoria> findByNomeStartingWith(String categoria);
}

