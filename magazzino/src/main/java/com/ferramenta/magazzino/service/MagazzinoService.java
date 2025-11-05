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
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;


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
        log.info("INIZIO - addArticolo");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        dto.setCategoria(addCategoria(dto.getCategoria(), dto.getSottoCategorie()));
        dto.setUbicazione(addUbicazione(dto.getUbicazione()));
        String idArticolo = UUID.randomUUID().toString();
        dto.setDataInserimento(LocalDate.now().format(formatter));
        dto.setIdArticolo(idArticolo);
        dto.setCodice(creaCodiceByNomeAndCategoriaAndUbicazione(dto.getNome(), dto.getCategoria(), dto.getUbicazione(), null));
        Articolo articolo = dtoToArticoloWithoutId(dto);
        articolo.setIdArticolo(idArticolo);
        articoliRepository.save(articolo);
        CompletableFuture.runAsync(this::updatedValoreMagazzino);
        log.info("FINE - addArticolo");
    }

    @Transactional
    public void updateArticolo(ArticoloDto dto){
        log.info("INIZIO - updateArticolo");
        try{
            dto.setCategoria(addCategoria(dto.getCategoria(), dto.getSottoCategorie()));
            dto.setUbicazione(addUbicazione(dto.getUbicazione()));
            dto.setCodice(creaCodiceByNomeAndCategoriaAndUbicazione(dto.getNome(), dto.getCategoria(), dto.getUbicazione(), dto.getId()));
            Articolo articolo = dtoToArticoloWithoutId(dto);
            if(!dto.isUpdatedQuantita()){
                articolo.setId(dto.getId());
            }else{
                int activeMod = articoliRepository.updateIsActiveInArticoli(dto.getIdArticolo(), false);
                String yearMonth = getYearMonth(dto.getDataModifica());
                articoliRepository.updateLastMonthRecordInArticoli(dto.getIdArticolo(),yearMonth, false);
                if(activeMod == 0){ throw new RuntimeException("Nessun record modificato per isActive"); }
            }
            articolo.setIdArticolo(dto.getIdArticolo());
            articoliRepository.save(articolo);
            if(dto.isUpdatedQuantita() || dto.isUpdatedCosto()){ CompletableFuture.runAsync(this::updatedValoreMagazzino); }
        }catch (Exception e){
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
        log.info("FINE - updateArticolo");
    }

    private String getYearMonth(String dataCompleta){
        String [] dataArray = dataCompleta.split("-");
        return dataArray[0] + "-" + dataArray[1];
    }

    public void deleteArticolo(List<Integer> ids){
        log.info("INIZIO - deleteArticolo");
        try{
            for(int id : ids){
                Articolo articolo = articoliRepository.findById(id);
                articoliRepository.delete(articolo);
            }
        }catch (Exception e){
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
        log.info("FINE - deleteArticolo");
    }

    public EntityResponseDto ricercaArticoliEntity(String nome, String categoria, List<String> sottoCategorie,String ubicazione, String codice, String da, String a, String daM, String aM ,Integer min, Integer max, Integer minCosto, Integer maxCosto, int limit, int offset, String sortField, String direzione, boolean exactMatch){
        log.info("INIZIO - ricercaArticoliEntity");
        if(sortField == null || sortField.isEmpty()){
            sortField = "richieste";
        }
        if(limit == 0){
            limit = Integer.MAX_VALUE;
        }
        List<Articolo> list = articoliRepository.searchArticoliEntity(nome, capitalize(categoria), sottoCategorie, capitalize(ubicazione),codice, da, a, daM, aM, min, max, minCosto, maxCosto, limit, offset, sortField, direzione,exactMatch);
        Articolo articolo = creaTotArticolo(nome, capitalize(categoria), sottoCategorie, capitalize(ubicazione));
        articolo.setValore(articoliRepository.sommaCampoEntity("valore", nome, capitalize(categoria), sottoCategorie, capitalize(ubicazione),exactMatch));
        articolo.setQuantita( articoliRepository.sommaCampoEntity("quantita", nome, capitalize(categoria), sottoCategorie, capitalize(ubicazione),exactMatch).intValue());
        articolo.setCosto(articoliRepository.sommaCampoEntity("costo", nome, capitalize(categoria), sottoCategorie, capitalize(ubicazione),exactMatch));
        list.add(articolo);
        long count = articoliRepository.countArticoliEntity(nome, capitalize(categoria),sottoCategorie, capitalize(ubicazione),codice, da, a, daM, aM, min, max, minCosto, maxCosto,exactMatch);
        log.info("FINE - ricercaArticoliEntity - risultati: {}", count);
        return EntityResponseDto.builder()
                .entity(list)
                .count(count)
                .build();
    }

    private Articolo creaTotArticolo(String nome, String categoria, List<String> stc, String ubicazione){
        Articolo articolo = new Articolo();
        articolo.setNome(nome != null ? nome : "");
        articolo.setCategoria(categoria != null ? categoria : "");
        articolo.setSottoCategorie(stc != null ? stc : new ArrayList<>());
        articolo.setUbicazione(ubicazione != null ? ubicazione : "");
        articolo.setCodice("Totale:");
        return articolo;
    }

    public EntityResponseDto ricercaArticoliGrafico(String anno){
        log.info("INIZIO - ricercaArticoliGrafico");
        List<Articolo> lastUtilMonths = articoliRepository.searchArticoloGrafico(anno);
        log.info("FINE - ricercaArticoliGrafico - articoli trovati: {}", lastUtilMonths.size());
        return EntityResponseDto.builder().
                entity(lastUtilMonths).
                build();
    }

    private void updatedValoreMagazzino(){
        log.info("INIZIO - updatedValoreMagazzino");
        List<Articolo> list = articoliRepository.searchArticoloGraficoActive();

        Map<String, LocalDate> mapDate = new HashMap<>();
        Map<Integer, String> map = new HashMap<>();
        Map<Integer, String> mapIdArticolo = new HashMap<>();
        LocalDate lastMonth = LocalDate.now();
        for (Articolo articolo : list) {
            LocalDate dataModifica = LocalDate.parse(articolo.getDataModifica());
            if (articolo.isActive()) {
                mapDate.put(articolo.getIdArticolo(), dataModifica);
                map.put(articolo.getId(), articolo.getDataModifica());
                mapIdArticolo.put(articolo.getId(), articolo.getIdArticolo());
            }
            if (dataModifica.isAfter(lastMonth)) {
                lastMonth = dataModifica;
            }
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedModifica = lastMonth.plusMonths(1).format(formatter);
        for (Map.Entry<Integer, String> item : map.entrySet()) {
            Integer id = item.getKey();
            ArticoloDto dto = new ArticoloDto();
            dto.setDataInserimento(item.getValue());
            dto.setDataModifica(formattedModifica);
            dto.setId(id);
            dto.setIdArticolo(mapIdArticolo.get(id));
            checkPrecedenteRecord(dto);
        }
        log.info("FINE - updatedValoreMagazzino");
    }

    private Articolo dtoToArticoloWithoutId(ArticoloDto dto){
        log.info("INIZIO - dtoToArticoloWithoutId");
        Articolo articolo = new Articolo();
        articolo.setNome(capitalize(dto.getNome()));
        articolo.setCodice(dto.getCodice());
        articolo.setUbicazione(capitalize(dto.getUbicazione()));
        articolo.setQuantita(dto.getQuantita());
        articolo.setCosto(dto.getCosto());
        articolo.setCategoria(dto.getCategoria());
        articolo.setSottoCategorie(dto.getSottoCategorie());
        articolo.setDataInserimento(dto.getDataInserimento());
        articolo.setDataModifica(dto.getDataModifica() != null ? dto.getDataModifica() : dto.getDataInserimento());
        double costoUnita;
        int richieste = dto.getRichieste();
        if(richieste == 0){
            articolo.setRichieste(1);
            costoUnita = dto.getCosto() / dto.getQuantita();
            if(Double.isNaN(costoUnita)) costoUnita = 0;
            dto.setCostoUnita(costoUnita);
            saveMerce(dto);
        }else if(dto.isUpdatedQuantita()){
            articolo.setRichieste(richieste + 1);

            if(dto.isUpdatedCosto()){
                costoUnita = dto.getCosto() / dto.getQuantita();
                if(Double.isNaN(costoUnita)) costoUnita = 0;
            }else{
                costoUnita = dto.getCostoUnita();
                dto.setCostoUnita(costoUnita);
            }

            updateMerce(dto);
        }else if(dto.isUpdatedCosto()){
            costoUnita = dto.getCosto() / dto.getQuantita();
            if(Double.isNaN(costoUnita)) costoUnita = 0;
            articolo.setRichieste(richieste);
        }else{
            articolo.setRichieste(richieste);
            costoUnita = dto.getCostoUnita();
        }
        articolo.setCostoUnita(costoUnita);
        articolo.setValore(costoUnita * dto.getQuantita());
        articolo.setActive(true);
        articolo.setLastMonthRecord(true);
        log.info("FINE - dtoToArticoloWithoutId");
        return articolo;
    }


    private void checkPrecedenteRecord(ArticoloDto dto){
        log.info("INIZIO - checkPrecedenteRecord");
        LocalDate modifica = LocalDate.parse(getYearMonth(dto.getDataModifica()) + "-01");
        LocalDate initialValue = LocalDate.parse(dto.getDataInserimento());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for(LocalDate i = initialValue.plusMonths(1); i.isBefore(modifica); i = i.plusMonths(1)){
            String formatted = i.format(formatter);
            String yearMonth = getYearMonth(formatted);
            Articolo articolo = articoliRepository.getRecordByidArticolAndYearMonthAndCategoria(dto.getIdArticolo(), yearMonth, "valoreStoricoMerce");
            if(articolo == null){
                log.info("Add dati valore magazzino per articolo: {}", dto.getNome());
                Articolo a = articoliRepository.findById(dto.getId());
                articolo = getArticolo(yearMonth, a, null);
                articoliRepository.save(articolo);
            }else {
                log.info("Update dati valore magazzino per articolo: {}", dto.getNome());
                Articolo a = articoliRepository.findById(dto.getId());
                String dataArticoloActive = a.getDataModifica().split("-")[1];
                String dataArticoloStorico = articolo.getDataModifica().split("-")[1];
                if(!dataArticoloStorico.equals(dataArticoloActive)){
                    articolo = getArticolo(yearMonth, a, articolo.getId());
                    articoliRepository.save(articolo);
                }
            }
        }
        log.info("FINE - checkPrecedenteRecord");
    }

    private static Articolo getArticolo(String yearMonth, Articolo a, Integer id) {
        Articolo articolo = new Articolo();
        articolo.setDataModifica(yearMonth + "-01");
        articolo.setDataInserimento(a.getDataInserimento());
        articolo.setCosto(a.getCosto());
        articolo.setValore(a.getValore());
        articolo.setQuantita(a.getQuantita());
        articolo.setIdArticolo(a.getIdArticolo());
        articolo.setCostoUnita(a.getCostoUnita());
        articolo.setCategoria("valoreStoricoMerce");
        articolo.setId(id);
        articolo.setActive(false);
        articolo.setLastMonthRecord(true);
        return articolo;
    }


    private void saveMerce(ArticoloDto dto){
        log.info("INIZIO - saveMerce");
        String [] data = dto.getDataInserimento().split("-");
        String idArticolo = dto.getIdArticolo();
        Merce merce = new Merce();
        int entrata;
        double valoreEntrata;
        entrata = dto.getQuantita();
        valoreEntrata = (dto.getQuantita() * dto.getCostoUnita());
        merce.setEntrata(entrata);
        merce.setMese(data[1]);
        merce.setAnno(data[0]);
        merce.setIdArticolo(idArticolo);
        merce.setValoreEntrate(valoreEntrata);
        merceRepository.save(merce);
        log.info("FINE - saveMerce");
    }

    private void updateMerce(ArticoloDto dto){
        log.info("INIZIO - updateMerce");
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
        double valoreEntrata;
        double valoreUscita;
        if(merceEsistente != null){
            if(diff < 0){
                entrata = merceEsistente.getEntrata() + Math.abs(diff);
                merceEsistente.setEntrata(entrata);
                valoreEntrata = merceEsistente.getValoreEntrate() + (Math.abs(diff) * dto.getCostoUnita());
                merceEsistente.setValoreEntrate(valoreEntrata);
            }
            if(diff > 0){
                uscita = merceEsistente.getUscita() + diff;
                merceEsistente.setUscita(uscita);
                valoreUscita = merceEsistente.getValoreUscite() + (diff * dto.getCostoUnita());
                merceEsistente.setValoreUscite(valoreUscita);
            }
            merceRepository.save(merceEsistente);
        }else{
            Merce merce = new Merce();
            if(diff < 0){
                entrata = Math.abs(diff);
                valoreEntrata = diff * dto.getCostoUnita();
                merce.setEntrata(entrata);
                merce.setValoreEntrate(valoreEntrata);
            }
            if(diff > 0){
                uscita = diff;
                valoreUscita = diff * dto.getCostoUnita();
                merce.setUscita(uscita);
                merce.setValoreUscite(valoreUscita);
            }
            merce.setMese(mese);
            merce.setAnno(anno);
            merce.setIdArticolo(idArticolo);
            merceRepository.save(merce);
        }
        log.info("FINE - updateMerce");
    }


    private String creaCodiceByNomeAndCategoriaAndUbicazione(String nome, String categoria, String ubicazione, Integer id){
        log.info("INIZIO - creaCodiceByNomeAndCategoriaAndUbicazione");
        String cat = Normalizer.normalize(categoria, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String ubi = Normalizer.normalize(ubicazione, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String n = Normalizer.normalize(nome, Normalizer.Form.NFD).substring(0,3).replaceAll("\\p{M}","");
        String codice = capitalize(cat) + capitalize(ubi) + capitalize(n);
        if(id == null){
            Integer lastId = articoliRepository.findLastId();
            if(lastId == null) lastId = 1;
            else { lastId += 1; }
            codice = codice + "-" +"0" + lastId;
        }else{
            codice = codice + "-" + "0" + id;
        }
        log.info("FINE - creaCodiceByNomeAndCategoriaAndUbicazione");
        return codice;
    }

    public String addCategoria(String categoria, List<String> sottoCategorie){
        log.info("INIZIO - addCategoria - nome categoria: {}", categoria);
        String capitalized = capitalize(categoria);
        Categoria categoriaEntity = categoriaRepository.findByNome(capitalized);
        if(categoriaEntity != null){
            List<String> listStc = categoriaEntity.getSottoCategorie();
            boolean isNewStc = false;
            if(listStc != null && !listStc.isEmpty()){
                for(String stc : sottoCategorie){
                    if(!listStc.contains(stc)){
                        listStc.add(stc);
                        isNewStc = true;
                    }
                }
            }else if(sottoCategorie != null){
                listStc = new ArrayList<>(sottoCategorie);
                isNewStc = true;
            }

            if(isNewStc){
                categoriaEntity.setSottoCategorie(listStc);
                categoriaRepository.save(categoriaEntity);
            }
        } else if(!capitalized.equals("Non categorizzato")){
            Categoria cat = new Categoria();
            cat.setNome(capitalized);
            cat.setSottoCategorie(sottoCategorie);
            categoriaRepository.save(cat);
        }
        log.info("FINE - addCategoria - nome categoria: {}", capitalized);
        return capitalized;
    }

    public String addUbicazione(String ubicazione){
        log.info("INIZIO - addUbicazione - nome ubicazione: {}", ubicazione);
        String capitalized = capitalize(ubicazione);
        if(ubicazioneRepository.findByNome(capitalized) == null && !capitalized.equals("Non ubicato")){
            Ubicazione ub = new Ubicazione();
            ub.setNome(capitalized);
            ubicazioneRepository.save(ub);
        }
        log.info("FINE - addUbicazione - nome ubicazione: {}", capitalized);
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
        log.info("INIZIO - deleteCategorie - categorie da cancellare : {}", articoli);
        for(Map.Entry<String, Integer> art : articoli.entrySet()){
            Categoria categoria = new Categoria();
            categoria.setId(Integer.parseInt(String.valueOf(art.getValue())));
            categoriaRepository.delete(categoria);
            articoliRepository.updateCategoriainArticoli(art.getKey(), "Non categorizzato");
            articoliRepository.clearSottoCategoriainArticoli("Non categorizzato");
        }
        log.info("FINE - deleteCategorie - categorie da cancellate : {}", articoli);
    }


    @Transactional
    public void updateCategoria(String oldCategoria, String newName, List<String> newStc){

        try{
            if(capitalize(newName).equalsIgnoreCase("Non categorizzato")){
                throw new AlreadyExistsException("Nome categoria non valido");
            }
            log.info("INIZIO - updateCategoria - categoria da aggiornare : {} in {}", oldCategoria, newName);
            String newNameCap = capitalize(newName);
            String oldCap = capitalize(oldCategoria);
            Categoria categoria = categoriaRepository.findByNome(oldCap);
            List<String> oldStc = categoria.getSottoCategorie() != null ? categoria.getSottoCategorie() : new ArrayList<>();
            if(newName != null && (newName.length() > 30 || newName.length() < 3)){
                throw new AlreadyExistsException("Inserire almeno 3 caratteri e massimo 30");
            }
            List<String> updated = new ArrayList<>();
            for(String stc : newStc){
                if(!stc.contains("-deleted") && !updated.contains(stc)){
                    updated.add(stc);
                }
            }

            categoria.setNome(newNameCap);
            categoria.setSottoCategorie(updated);
            categoriaRepository.save(categoria);
            updateCategoriaInArticoli(oldCap, newNameCap);
            updateSottoCategoriaInArticoli(oldStc, newStc);
            log.info("FINE - updateCategoria - categoria aggiornata : {} in {}", oldCap, newNameCap);
        }catch (AlreadyExistsException e){
            log.error(e.getMessage());
            throw new AlreadyExistsException(e.getMessage());
        }catch (Exception e){
            log.error(e.getMessage());
            throw new RuntimeException(e.getMessage());
        }

    }

    @Transactional
    public void updateCategoriaInArticoli(String oldCategoria, String newName){
        log.info("INIZIO - updateCategoriaInArticoli");
        articoliRepository.updateCategoriainArticoli(oldCategoria, newName);
        List<Articolo> list = articoliRepository.findByCategoria(newName);
        for(Articolo art : list){
            art.setCodice(creaCodiceByNomeAndCategoriaAndUbicazione(art.getNome(), newName, art.getUbicazione(), art.getId()));
            articoliRepository.save(art);
        }
        log.info("FINE - updateCategoriaInArticoli");
    }

    @Transactional
    public void updateSottoCategoriaInArticoli(List<String> oldStc, List<String> newStc){
        log.info("INIZIO - updateSottoCategoriaInArticoli");
        for(int i = 0; i < oldStc.size(); i++){
            List<Articolo> arts = articoliRepository.findBySottoCategoria(oldStc.get(i));
            for(Articolo art : arts){
                List<String> updatedStc = new ArrayList<>();
                for(int j = 0; j < art.getSottoCategorie().size(); j++){
                    if(art.getSottoCategorie().get(j).equals(oldStc.get(i))){
                        if(!newStc.get(i).contains("-deleted") && !updatedStc.contains(newStc.get(i))){
                            updatedStc.add(newStc.get(i));
                        }
                    }else{
                        updatedStc.add(art.getSottoCategorie().get(j));
                    }
                }
                art.setSottoCategorie(updatedStc);
                articoliRepository.save(art);
            }
        }
        log.info("FINE - updateSottoCategoriaInArticoli");
    }

    public EntityResponseDto getCategoria(String categoria, int limit, int offset){
        log.info("INIZIO - getCategoria - filtro ricerca: {}", categoria);
        if(limit == 0){
            limit = Integer.MAX_VALUE;
        }
        List<Categoria> categorie = categoriaRepository.searchCategorie(categoria, limit, offset);
        long count = categoriaRepository.countCategorie(categoria);
        log.info("FINE - getCategoria - risultati: {}", count);
        return EntityResponseDto.builder()
                .entity(categorie)
                .count(count)
                .build();
    }


    @Transactional
    public void deleteUbicazione(Map<String, Integer> articoli){
        log.info("INIZIO - deleteUbicazione - - ubicazioni da cancellare : {}", articoli);
        for(Map.Entry<String, Integer> art : articoli.entrySet()){
            Ubicazione ubicazione = new Ubicazione();
            ubicazione.setId(Integer.parseInt(String.valueOf(art.getValue())));
            ubicazioneRepository.delete(ubicazione);
            articoliRepository.updateUbicazioneinArticoli(art.getKey(), "Non ubicato");
        }
        log.info("FINE - deleteUbicazione - - ubicazioni cancellate : {}", articoli);
    }

    @Transactional
    public void updateUbicazione(String oldUbicazione, String newName){
        log.info("INIZIO - updateUbicazione - ubicazione da aggiornare : {} in {}", oldUbicazione, newName);
        String newNameCap = capitalize(newName);
        if(newNameCap.equalsIgnoreCase("Non ubicato")){ throw new AlreadyExistsException("Nome ubicazione non valido"); }
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
        log.info("FINE - updateUbicazione - ubicazione aggiornata : {} in {}", oldCap, newNameCap);
    }

    public void updateUbicazioneInArticoli(String oldUbicazione, String newName){
        log.info("INIZIO - updateUbicazioneInArticoli");
        articoliRepository.updateUbicazioneinArticoli(oldUbicazione, newName);
        List<Articolo> list = articoliRepository.findByCategoria(newName);
        for(Articolo art : list){
            art.setCodice(creaCodiceByNomeAndCategoriaAndUbicazione(art.getNome(), newName, art.getUbicazione(), art.getId()));
            articoliRepository.save(art);
        }
        log.info("FINE - updateUbicazioneInArticoli");
    }

    public EntityResponseDto getUbicazione(String ubicazione, int limit, int offset){
        log.info("INIZIO - getUbicazione - filtro ricerca: {}", ubicazione);
        if(limit == 0){
            limit = Integer.MAX_VALUE;
        }
        List<Ubicazione> ubicazioni = ubicazioneRepository.searchUbicazione(ubicazione, limit, offset);
        long count = ubicazioneRepository.countUbicazione(ubicazione);
        log.info("FINE - getUbicazione - risultati: {}", count);
        return EntityResponseDto.builder()
                .entity(ubicazioni)
                .count(count)
                .build();
    }

    public EntityResponseDto ricercaMerce(String anno){
        log.info("INIZIO - ricercaMerce - filtro ricerca: {}", anno);
        List<Merce> list = merceRepository.findByAnno(anno);
        Map<String, Integer> mapEntrata = new HashMap<>();
        Map<String, Integer> mapUscita = new HashMap<>();
        Map<String, Double> mapEntrataValore = new HashMap<>();
        Map<String, Double> mapUscitaValore = new HashMap<>();
        List<Merce> summedList = new ArrayList<>();
        for(Merce merce : list){
            int entrata = 0;
            double valoreEntrata = 0.0;
            String mese = merce.getMese();
            if(mapEntrata.get(mese) != null){
                entrata = mapEntrata.get(mese);
                valoreEntrata = mapEntrataValore.get(mese);
            }
            int sumEntrata = entrata + merce.getEntrata();
            double sumValoreEntrata = valoreEntrata + merce.getValoreEntrate();
            mapEntrata.put(mese, sumEntrata);
            mapEntrataValore.put(mese, sumValoreEntrata);

            int uscita = 0;
            double valoreUscita = 0.0;
            if(mapUscita.get(mese) != null){
                uscita = mapUscita.get(mese);
                valoreUscita = mapUscitaValore.get(mese);
            }
            int sumUscita = uscita + merce.getUscita();
            double sumValoreUscita = valoreUscita + merce.getValoreUscite();
            mapUscita.put(mese, sumUscita);
            mapUscitaValore.put(mese, sumValoreUscita);
        }
        for( Map.Entry<String, Integer> entrata : mapEntrata.entrySet()){
            Merce merce = new Merce();
            merce.setAnno(anno);
            merce.setMese(entrata.getKey());
            merce.setEntrata(entrata.getValue());
            merce.setValoreEntrate(mapEntrataValore.get(entrata.getKey()));
            merce.setUscita(mapUscita.get(entrata.getKey()));
            merce.setValoreUscite(mapUscitaValore.get(entrata.getKey()));
            summedList.add(merce);
        }
        log.info("FINE - ricercaMerce - risultati: {}", summedList.size());
        return EntityResponseDto.builder()
                .entity(summedList)
                .build();
    }

}
