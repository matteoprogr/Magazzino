package com.ferramenta.magazzino.service;

import com.ferramenta.magazzino.dto.ArticoloDto;
import com.ferramenta.magazzino.entity.Articolo;
import com.ferramenta.magazzino.entity.Categoria;
import com.ferramenta.magazzino.repository.ArticoliRepository;
import com.ferramenta.magazzino.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;


@Service
public class MagazzinoService {

    private final ArticoliRepository articoliRepository;
    private final CategoriaRepository categoriaRepository;

    public MagazzinoService(ArticoliRepository articoliRepository, CategoriaRepository categoriaRepository) {
        this.articoliRepository = articoliRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public void addArticolo(ArticoloDto dto){
        addCategoria(dto.getCategoria());

        Articolo articolo = dtoToArticoloWithoutId(dto);
        articoliRepository.save(articolo);
    }

    public void updateArticolo(ArticoloDto dto){
        addCategoria(dto.getCategoria());

        Articolo articolo = dtoToArticoloWithoutId(dto);
        articolo.setId(dto.getId());
        articoliRepository.save(articolo);
    }

    public void deleteArticolo(List<Integer> ids){
        for(int id : ids){
            Articolo articolo = new Articolo();
            articolo.setId(id);
            articoliRepository.delete(articolo);
        }

    }

    public List<Articolo> ricercaArticoli(String nome, String categoria, String codice, Integer min, Integer max, int limit, int offset){
    return articoliRepository.searchArticoli(nome, categoria, codice,min, max, limit, offset);
    }

    private Articolo dtoToArticoloWithoutId(ArticoloDto dto){
        Articolo articolo = new Articolo();
        articolo.setNome(dto.getNome());
        articolo.setCodice(dto.getCodice());
        articolo.setQuantita(dto.getQuantita());
        articolo.setCategoria(dto.getCategoria());
        return articolo;
    }

    public void addCategoria(String categoria){
        if(categoriaRepository.findByNome(categoria) == null){
            Categoria cat = new Categoria();
            cat.setNome(capitalize(categoria));
            categoriaRepository.save(cat);
        }
    }

    private String capitalize(String categoria){
        String cat = categoria.substring(0,1).toUpperCase();
        String newCategoria = categoria.substring(1).toLowerCase();
        return cat + newCategoria;
    }

    @Transactional
    public void deleteCategorie(Map<String, Integer> articoli){
        for(Map.Entry<String, Integer> art : articoli.entrySet()){
            Categoria categoria = new Categoria();
            categoria.setId(Integer.parseInt(String.valueOf(art.getValue())));
            categoriaRepository.delete(categoria);
            articoliRepository.updateCategoriainArticoli(art.getKey(), "NON CATEGORIZZATO");
        }
    }

    @Transactional
    public void updateCategoria(String oldCategoria, String newName){
        Categoria categoria = categoriaRepository.findByNome(oldCategoria);
        categoria.setNome(newName);
        categoriaRepository.save(categoria);
        updateCategoriaInArticoli(oldCategoria, newName);
    }

    public void updateCategoriaInArticoli(String oldCategoria, String newName){
        articoliRepository.updateCategoriainArticoli(oldCategoria, newName);
    }

    public List<Categoria> getCategoria(String categoria){
        return categoriaRepository.findByNomeStartingWith(categoria);
    }
}
