package com.ferramenta.magazzino.controller;

import com.ferramenta.magazzino.dto.ResponseDto;
import com.ferramenta.magazzino.dto.ArticoloDto;
import com.ferramenta.magazzino.entity.Articolo;
import com.ferramenta.magazzino.entity.Categoria;
import com.ferramenta.magazzino.service.MagazzinoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/magazzino")
@CrossOrigin(origins = "*")
public class MagazzinoController {

    private final MagazzinoService magazzinoService;

    public MagazzinoController(MagazzinoService magazzinoService) {
        this.magazzinoService = magazzinoService;
    }

    @PostMapping("/aggiungi")
    public ResponseDto aggiungiArticolo(@RequestBody ArticoloDto articoloDto){

        try{
            magazzinoService.addArticolo(articoloDto);
        }catch (Exception e){
            return new ResponseDto("Errore durante l'aggiunta dell'articolo", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("Articolo aggiunto con successo", HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseDto modificaArticolo(@RequestBody ArticoloDto articoloDto){

        try{
            magazzinoService.updateArticolo(articoloDto);
        }catch (Exception e){
            return new ResponseDto("Errore durante l'update dell'articolo", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("Articolo modificato con successo", HttpStatus.OK);
    }

    @DeleteMapping("/delete")
    public ResponseDto eliminaArticolo(@RequestParam List<Integer> ids){

        try{
            magazzinoService.deleteArticolo(ids);
        }catch (Exception e){
            return new ResponseDto("Errore durante il delete dell'articolo", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("Articolo eliminato con successo", HttpStatus.OK);
    }

    @GetMapping("/ricerca")
    public List<Articolo> ricerca(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String codice,
            @RequestParam(required = false) Integer min,
            @RequestParam(required = false) Integer max,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try{
            return magazzinoService.ricercaArticoli(nome, categoria, codice, min, max, size,page * size);
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @PutMapping("/updateCategoria")
    public ResponseDto modificaCategoria(
            @RequestParam String oldCategoria,
            @RequestParam String newName){

        try{
            magazzinoService.updateCategoria(oldCategoria, newName);
        }catch (Exception e){
            return new ResponseDto("Errore durante l'update della categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("Categoria modificata con successo", HttpStatus.OK);
    }

    @DeleteMapping("/deleteCategorie")
    public ResponseDto eliminaCategorie(@RequestParam Map<String, Integer> ids){

        try{
            magazzinoService.deleteCategorie(ids);
        }catch (Exception e){
            return new ResponseDto("Errore durante il delete della categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("categoria eliminato con successo", HttpStatus.OK);
    }

    @GetMapping("/ricercaCategorie")
    public List<Categoria> ricercaCategorie(@RequestParam(required = false) String categoria){

        try{
            return magazzinoService.getCategoria(categoria);
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/aggiungiCategoria")
    public ResponseDto aggiungiCategoria(@RequestParam String categoria){

        try{
            magazzinoService.addCategoria(categoria);
        }catch (Exception e){
            return new ResponseDto("Errore durante l'aggiunta della categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("Categoria aggiunto con successo", HttpStatus.OK);
    }

}
