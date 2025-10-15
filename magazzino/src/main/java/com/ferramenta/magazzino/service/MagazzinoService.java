package com.ferramenta.magazzino.service;

import com.ferramenta.magazzino.advice.AlreadyExistsException;
import com.ferramenta.magazzino.dto.ArticoloDto;
import com.ferramenta.magazzino.dto.EntityResponseDto;
import com.ferramenta.magazzino.entity.Articolo;
import com.ferramenta.magazzino.entity.Categoria;
import com.ferramenta.magazzino.repository.ArticoliRepository;
import com.ferramenta.magazzino.repository.CategoriaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;


@Service
@Slf4j
public class MagazzinoService {

    private final ArticoliRepository articoliRepository;
    private final CategoriaRepository categoriaRepository;

    public MagazzinoService(ArticoliRepository articoliRepository, CategoriaRepository categoriaRepository) {
        this.articoliRepository = articoliRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public void addArticolo(ArticoloDto dto){
        dto.setCategoria(addCategoria(dto.getCategoria()));

        dto.setCodice(creaCodiceByNomeAndCategoria(dto.getNome(), dto.getCategoria(), dto.getUbicazione(), null));
        Articolo articolo = dtoToArticoloWithoutId(dto);
        articoliRepository.save(articolo);
    }

    public void updateArticolo(ArticoloDto dto){
        dto.setCategoria(addCategoria(dto.getCategoria()));
        dto.setCodice(creaCodiceByNomeAndCategoria(dto.getNome(), dto.getCategoria(), dto.getUbicazione(), dto.getId()));
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

    public EntityResponseDto ricercaArticoli(String nome, String categoria, String ubicazione, String codice, String da, String a, Integer min, Integer max, Integer minCosto, Integer maxCosto, int limit, int offset){

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime dateDa = null;
        LocalDateTime dateA = null;
        if (da != null && !da.isEmpty()) {
            dateDa = LocalDate.parse(da, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
            da = dateDa.format(formatter);
        }

        if (a != null && !a.isEmpty()) {
            dateA = LocalDate.parse(a, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atTime(23, 59, 59);
            a = dateA.format(formatter);
        }
        if(limit == 0){
            limit = Integer.MAX_VALUE;
        }
        List<Articolo> list = articoliRepository.searchArticoli(nome, capitalize(categoria), capitalize(ubicazione),codice, da, a, min, max, minCosto, maxCosto, limit, offset);
        long count = articoliRepository.countArticoli(nome, capitalize(categoria), codice,min, max);
        return new EntityResponseDto(list,count);
    }

    private Articolo dtoToArticoloWithoutId(ArticoloDto dto){
        Articolo articolo = new Articolo();
        articolo.setNome(capitalize(dto.getNome()));
        articolo.setCodice(dto.getCodice());
        articolo.setUbicazione(capitalize(dto.getUbicazione()));
        articolo.setQuantita(dto.getQuantita());
        articolo.setCosto(dto.getCosto());
        articolo.setCategoria(dto.getCategoria());
        articolo.setDataInserimento(dto.getDataInserimento());
        int richieste = articolo.getRichieste();
        if(richieste == 0){
            articolo.setRichieste(1);
        }else{
            articolo.setRichieste(richieste + 1);
        }

        return articolo;
    }

    private String creaCodiceByNomeAndCategoria(String nome, String categoria, String ubicazione, Integer id){
        String cat = Normalizer.normalize(categoria, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String ubi = Normalizer.normalize(ubicazione, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String n = Normalizer.normalize(nome, Normalizer.Form.NFD).replaceAll("\\p{M}","").replaceAll("(?i)[AEIOU]|\\W]","");
        StringBuilder codiceBase = new StringBuilder(cat + "-" + ubi + "-" + n);
        int codLength = codiceBase.length();
        int sizeCod = 11;
        if(codLength < sizeCod){
            int diff = sizeCod - codLength;
            codiceBase.append("X".repeat(Math.max(0, diff)));
        }else if(codLength > sizeCod){
            codiceBase = new StringBuilder(codiceBase.substring(0, sizeCod));
        }

        String codice;
        if(id == null){
            Integer lastId = articoliRepository.findLastId();
            if(lastId == null) lastId = 1;
            else { lastId += 1; }
            codice = codiceBase + "-" +"0" + lastId;
        }else{
            codice = codiceBase + "-" + "0" + id;
        }

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
            return (cat + newCategoria).trim();
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
            articoliRepository.updateCategoriainArticoli(art.getKey(), "Non categorizzato");
        }
    }

    @Transactional
    public void updateCategoria(String oldCategoria, String newName){
        String newNameCap = capitalize(newName);
        String oldCap = capitalize(oldCategoria);
        if(categoriaRepository.findByNome(newNameCap) != null){
            throw new AlreadyExistsException("Categoria già presente");
        }
        Categoria categoria = categoriaRepository.findByNome(oldCap);
        categoria.setNome(newNameCap);
        categoriaRepository.save(categoria);
        updateCategoriaInArticoli(oldCap, newNameCap);
    }

    public void updateCategoriaInArticoli(String oldCategoria, String newName){
        articoliRepository.updateCategoriainArticoli(oldCategoria, newName);
        List<Articolo> list = articoliRepository.findByCategoria(newName);
        for(Articolo art : list){
            art.setCodice(creaCodiceByNomeAndCategoria(art.getNome(), newName, art.getUbicazione(), art.getId()));
            articoliRepository.save(art);
        }
    }

    public EntityResponseDto getCategoria(String categoria, int limit, int offset){
        if(limit == 0){
            limit = Integer.MAX_VALUE;
        }
        List<Categoria> categorie = categoriaRepository.searchCategorie(categoria, limit, offset);
        long count = categoriaRepository.countCategorie(categoria);

        return new EntityResponseDto(categorie, count);
    }
}
