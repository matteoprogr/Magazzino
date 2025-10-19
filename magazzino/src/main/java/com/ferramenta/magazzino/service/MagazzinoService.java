package com.ferramenta.magazzino.service;

import com.ferramenta.magazzino.advice.AlreadyExistsException;
import com.ferramenta.magazzino.dto.ArticoloDto;
import com.ferramenta.magazzino.dto.EntityResponseDto;
import com.ferramenta.magazzino.entity.*;
import com.ferramenta.magazzino.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.*;


@Service
@Slf4j
public class MagazzinoService {

    private final ArticoliRepository articoliRepository;
    private final CategoriaRepository categoriaRepository;
    private final UbicazioneRepository ubicazioneRepository;
    private final MerceRepository merceRepository;

    public MagazzinoService(ArticoliRepository articoliRepository, CategoriaRepository categoriaRepository, UbicazioneRepository ubicazioneRepository, MerceRepository merceRepository) {
        this.articoliRepository = articoliRepository;
        this.categoriaRepository = categoriaRepository;
        this.ubicazioneRepository = ubicazioneRepository;
        this.merceRepository = merceRepository;
    }


    public void addArticolo(ArticoloDto dto){
        dto.setCategoria(addCategoria(dto.getCategoria()));
        dto.setUbicazione(addUbicazione(dto.getUbicazione()));
        String idArticolo = UUID.randomUUID().toString();
        dto.setIdArticolo(idArticolo);
        dto.setCodice(creaCodiceByNomeAndCategoriaAndUbicazione(dto.getNome(), dto.getCategoria(), dto.getUbicazione(), null));
        Articolo articolo = dtoToArticoloWithoutId(dto);
        articolo.setIdArticolo(idArticolo);
        articoliRepository.save(articolo);
    }

    @Transactional
    public void updateArticolo(ArticoloDto dto){
        try{
            dto.setCategoria(addCategoria(dto.getCategoria()));
            dto.setUbicazione(addUbicazione(dto.getUbicazione()));
            dto.setCodice(creaCodiceByNomeAndCategoriaAndUbicazione(dto.getNome(), dto.getCategoria(), dto.getUbicazione(), dto.getId()));
            Articolo articolo = dtoToArticoloWithoutId(dto);
            if(!dto.isUpdatedQuantita()){
                articolo.setId(dto.getId());
            }else{
                int activeMod = articoliRepository.updateIsActiveInArticoli(dto.getIdArticolo(), false);
                String yearMonth = getYaerMonth(dto.getDataModifica());
                articoliRepository.updateLastMonthRecordInArticoli(dto.getIdArticolo(),yearMonth, false);
                if(activeMod == 0){ throw new RuntimeException("Nessun record modificato per isActive"); }
            }
            articolo.setIdArticolo(dto.getIdArticolo());
            articoliRepository.save(articolo);
        }catch (Exception e){
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    private String getYaerMonth(String dataCompleta){
        String [] dataArray = dataCompleta.split("-");
        return dataArray[0] + "-" + dataArray[1];
    }

    public void deleteArticolo(List<Integer> ids){
        try{
            for(int id : ids){
                Articolo articolo = articoliRepository.findById(id);
                articoliRepository.delete(articolo);
                merceRepository.deleteByIdArticolo(articolo.getIdArticolo());
            }
        }catch (Exception e){
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public EntityResponseDto ricercaArticoli(String nome, String categoria, String ubicazione, String codice, String da, String a, Integer min, Integer max, Integer minCosto, Integer maxCosto, int limit, int offset, String sortField){

        if(sortField == null || sortField.isEmpty()){
            sortField = "richieste";
        }
        if(limit == 0){
            limit = Integer.MAX_VALUE;
        }
        List<Articolo> list = articoliRepository.searchArticoli(nome, capitalize(categoria), capitalize(ubicazione),codice, da, a, min, max, minCosto, maxCosto, limit, offset, sortField);
        long count = articoliRepository.countArticoli(nome, capitalize(categoria), capitalize(ubicazione),codice, da, a, min, max, minCosto, maxCosto);
        return new EntityResponseDto(list,count);
    }

    public EntityResponseDto ricercaArticoliGrafico(String anno){

        List<Articolo> list = articoliRepository.searchArticoloGrafico(anno);
        return new EntityResponseDto(list,0);
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
        articolo.setDataModifica(dto.getDataModifica() != null ? dto.getDataModifica() : dto.getDataInserimento());
        double costoUnita = 0.0;
        int richieste = dto.getRichieste();
        if(richieste == 0){
            articolo.setRichieste(1);
            costoUnita = Math.round( ((double) dto.getCosto() / dto.getQuantita()) * 100.0) / 100.0;
            saveMerce(dto);
        }else if(dto.isUpdatedQuantita()){
            articolo.setRichieste(richieste + 1);
            updateMerce(dto);
            costoUnita = dto.getCostoUnita();
        }else if(dto.isUpdatedCosto()){
            costoUnita = Math.round( ((double) dto.getCosto() / dto.getQuantita()) * 100.0) / 100.0;
        }else{
            articolo.setRichieste(richieste);
        }
        articolo.setCostoUnita(costoUnita);
        articolo.setActive(true);
        articolo.setLastMonthRecord(true);
        return articolo;
    }


    private void saveMerce(ArticoloDto dto){
        String [] data = dto.getDataInserimento().split("-");
        String idArticolo = dto.getIdArticolo();
        Merce merce = new Merce();
        Merce merceEsistente = merceRepository.findByMeseAndAnnoAndIdArticolo(data[1],data[0],idArticolo);
        int entrata;
        if(merceEsistente != null){
            entrata = merceEsistente.getEntrata();
            entrata += dto.getQuantita();
            merceEsistente.setEntrata(entrata);
            merceRepository.save(merceEsistente);
        }else{
            entrata = dto.getQuantita();
            merce.setEntrata(entrata);
            merce.setMese(data[1]);
            merce.setAnno(data[0]);
            merce.setIdArticolo(idArticolo);
            merceRepository.save(merce);
        }
    }

    private void updateMerce(ArticoloDto dto){
        Articolo articolo = articoliRepository.findById(dto.getId());
        int diff = articolo.getQuantita() - dto.getQuantita();
        String mese;
        String anno;
        String idArticolo = dto.getIdArticolo();
        String dataModifica = dto.getDataModifica();
        if(dataModifica != null){
            String [] data = dataModifica.split("-");
            mese = data[1];
            anno = data[0];
        }else{
            LocalDate oggi = LocalDate.now();
            mese = String.valueOf(oggi.getMonthValue());
            anno = String.valueOf(oggi.getYear());
        }

        Merce merceEsistente = merceRepository.findByMeseAndAnnoAndIdArticolo(mese,anno,idArticolo);
        int entrata;
        int uscita;
        if(merceEsistente != null){
            if(diff < 0){
                entrata = merceEsistente.getEntrata() + Math.abs(diff);
                merceEsistente.setEntrata(entrata);
            }
            if(diff > 0){
                uscita = merceEsistente.getUscita() + diff;
                merceEsistente.setUscita(uscita);
            }
            merceRepository.save(merceEsistente);
        }else{
            Merce merce = new Merce();
            if(diff < 0){
                entrata = merce.getEntrata() + Math.abs(diff);
                merce.setEntrata(entrata);
            }
            if(diff > 0){
                uscita = merce.getUscita() + diff;
                merce.setUscita(uscita);
            }
            merce.setMese(mese);
            merce.setAnno(anno);
            merce.setIdArticolo(idArticolo);
            merceRepository.save(merce);
        }
    }


    private String creaCodiceByNomeAndCategoriaAndUbicazione(String nome, String categoria, String ubicazione, Integer id){
        String cat = Normalizer.normalize(categoria, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String ubi = Normalizer.normalize(ubicazione, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String n = Normalizer.normalize(nome, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String codice = cat + "-" + ubi + "-" + n;
        if(id == null){
            Integer lastId = articoliRepository.findLastId();
            if(lastId == null) lastId = 1;
            else { lastId += 1; }
            codice = codice + "-" +"0" + lastId;
        }else{
            codice = codice + "-" + "0" + id;
        }

        return codice.toUpperCase();
    }

    public String addCategoria(String categoria){
        String capitalized = capitalize(categoria);
        if(categoriaRepository.findByNome(capitalized) == null){
            Categoria cat = new Categoria();
            cat.setNome(capitalized);
            categoriaRepository.save(cat);
        }
        return capitalized;
    }

    public String addUbicazione(String ubicazione){
        String capitalized = capitalize(ubicazione);
        if(ubicazioneRepository.findByNome(capitalized) == null){
            Ubicazione ub = new Ubicazione();
            ub.setNome(capitalized);
            ubicazioneRepository.save(ub);
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
        if(newName != null && (newName.length() > 30 || newName.length() < 3)){
            throw new AlreadyExistsException("Inserire almeno 3 caratteri e massimo 30");
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
            art.setCodice(creaCodiceByNomeAndCategoriaAndUbicazione(art.getNome(), newName, art.getUbicazione(), art.getId()));
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


    @Transactional
    public void deleteUbicazione(Map<String, Integer> articoli){
        for(Map.Entry<String, Integer> art : articoli.entrySet()){
            Ubicazione ubicazione = new Ubicazione();
            ubicazione.setId(Integer.parseInt(String.valueOf(art.getValue())));
            ubicazioneRepository.delete(ubicazione);
            articoliRepository.updateUbicazioneinArticoli(art.getKey(), "Non ubicato");
        }
    }

    @Transactional
    public void updateUbicazione(String oldUbicazione, String newName){
        String newNameCap = capitalize(newName);
        String oldCap = capitalize(oldUbicazione);
        if(ubicazioneRepository.findByNome(newNameCap) != null){
            throw new AlreadyExistsException("Ubicazione già presente");
        }
        if(newName != null && (newName.length() > 30 || newName.length() < 3)){
            throw new AlreadyExistsException("Inserire almeno 3 caratteri e massimo 30");
        }
        Ubicazione ubicazione = ubicazioneRepository.findByNome(oldCap);
        ubicazione.setNome(newNameCap);
        ubicazioneRepository.save(ubicazione);
        updateUbicazioneInArticoli(oldCap, newNameCap);
    }

    public void updateUbicazioneInArticoli(String oldUbicazione, String newName){
        articoliRepository.updateUbicazioneinArticoli(oldUbicazione, newName);
        List<Articolo> list = articoliRepository.findByCategoria(newName);
        for(Articolo art : list){
            art.setCodice(creaCodiceByNomeAndCategoriaAndUbicazione(art.getNome(), newName, art.getUbicazione(), art.getId()));
            articoliRepository.save(art);
        }
    }

    public EntityResponseDto getUbicazione(String ubicazione, int limit, int offset){
        if(limit == 0){
            limit = Integer.MAX_VALUE;
        }
        List<Ubicazione> ubicazioni = ubicazioneRepository.searchUbicazione(ubicazione, limit, offset);
        long count = ubicazioneRepository.countUbicazione(ubicazione);

        return new EntityResponseDto(ubicazioni, count);
    }

    public EntityResponseDto ricercaMerce(String anno){
        List<Merce> list = merceRepository.findByAnno(anno);
        Map<String, Integer> mapEntrata = new HashMap<>();
        Map<String, Integer> mapUscita = new HashMap<>();
        List<Merce> summedList = new ArrayList<>();
        for(Merce merce : list){
            int valueEntrata = 0;
            if(mapEntrata.get(merce.getMese()) != null){
                valueEntrata = mapEntrata.get(merce.getMese());
            }
            int sumEntrata = valueEntrata + merce.getEntrata();
            mapEntrata.put(merce.getMese(), sumEntrata);

            int valueUscita = 0;
            if(mapUscita.get(merce.getMese()) != null){
                valueUscita = mapUscita.get(merce.getMese());
            }
            int sumUscita = valueUscita + merce.getUscita();
            mapUscita.put(merce.getMese(), sumUscita);
        }
        for( Map.Entry<String, Integer> entrata : mapEntrata.entrySet()){
            Merce merce = new Merce();
            merce.setAnno(anno);
            merce.setMese(entrata.getKey());
            merce.setEntrata(entrata.getValue());
            merce.setUscita(mapUscita.get(entrata.getKey()));
            summedList.add(merce);
        }

        return new EntityResponseDto(summedList, 0);
    }

}
