package com.ferramenta.magazzino.service;

import com.ferramenta.magazzino.dto.ArticoloDto;
import com.ferramenta.magazzino.dto.EntityResponseDto;
import com.ferramenta.magazzino.entity.Articolo;
import com.ferramenta.magazzino.entity.Categoria;
import com.ferramenta.magazzino.repository.ArticoliRepository;
import com.ferramenta.magazzino.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
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
        dto.setCategoria(addCategoria(dto.getCategoria()));

        dto.setCodice(creaCodiceByNomeAndCategoria(dto.getNome(), dto.getCategoria()));
        Articolo articolo = dtoToArticoloWithoutId(dto);
        articoliRepository.save(articolo);
    }

    public void updateArticolo(ArticoloDto dto){
        dto.setCategoria(addCategoria(dto.getCategoria()));

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

    public EntityResponseDto ricercaArticoli(String nome, String categoria, String codice, Integer min, Integer max, int limit, int offset){
    List<Articolo> list = articoliRepository.searchArticoli(nome, capitalize(categoria), codice,min, max, limit, offset);
    long count = articoliRepository.countArticoli(nome, capitalize(categoria), codice,min, max);
    return new EntityResponseDto(list,count);
    }

    private Articolo dtoToArticoloWithoutId(ArticoloDto dto){
        Articolo articolo = new Articolo();
        articolo.setNome(dto.getNome());
        articolo.setCodice(dto.getCodice());
        articolo.setQuantita(dto.getQuantita());
        articolo.setCategoria(dto.getCategoria());
        return articolo;
    }

    private String creaCodiceByNomeAndCategoria(String nome, String categoria){
        String cat = Normalizer.normalize(categoria, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String n = Normalizer.normalize(nome, Normalizer.Form.NFD).replaceAll("\\p{M}","").replaceAll("(?i)[AEIOU]|\\W]","");
        StringBuilder codiceBase = new StringBuilder(cat + "-" + n);
        int codLength = codiceBase.length();
        int sizeCod = 7;
        if(codLength < sizeCod){
            int diff = sizeCod - codLength;
            codiceBase.append("X".repeat(Math.max(0, diff)));
        }else if(codLength > sizeCod){
            codiceBase = new StringBuilder(codiceBase.substring(0, sizeCod));
        }

        String lastId = String.valueOf(articoliRepository.findLastId());
        if(lastId.equals("null")) lastId = "0";
        String codice = codiceBase + "0" + lastId;
        return codice.toUpperCase();
    }

    public String addCategoria(String categoria){
        String capitalized = capitalize(categoria);
        if(categoriaRepository.findByNome(capitalized) == null){
            Categoria cat = new Categoria();
            cat.setNome(capitalized);
            categoriaRepository.save(cat);
            return capitalized;
        }
        return capitalized;
    }

    private String capitalize(String categoria){
        if(categoria != null){
            String cat = categoria.substring(0,1).toUpperCase();
            String newCategoria = categoria.substring(1).toLowerCase();
            return cat + newCategoria;
        }else {
            return null;
        }

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

    public EntityResponseDto getCategoria(String categoria, int limit, int offset){
        List<Categoria> categorie = categoriaRepository.searchCategorie(categoria, limit, offset);
        long count = categoriaRepository.countCategorie(categoria);
        return new EntityResponseDto(categorie, count);
    }
}
