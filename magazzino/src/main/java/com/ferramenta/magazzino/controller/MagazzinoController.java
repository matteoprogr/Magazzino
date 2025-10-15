package com.ferramenta.magazzino.controller;

import com.ferramenta.magazzino.advice.AlreadyExistsException;
import com.ferramenta.magazzino.dto.CategoriaDto;
import com.ferramenta.magazzino.dto.EntityResponseDto;
import com.ferramenta.magazzino.dto.ResponseDto;
import com.ferramenta.magazzino.dto.ArticoloDto;
import com.ferramenta.magazzino.service.MagazzinoService;
import jakarta.validation.Valid;
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
    public ResponseDto aggiungiArticolo(@Valid @RequestBody ArticoloDto articoloDto){

        try{
            magazzinoService.addArticolo(articoloDto);
        }catch (Exception e){
            return new ResponseDto("Errore durante l'aggiunta dell'articolo", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("Articolo aggiunto con successo", HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseDto modificaArticolo(@Valid @RequestBody ArticoloDto articoloDto){

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
    public EntityResponseDto ricerca(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String ubicazione,
            @RequestParam(required = false) String codice,
            @RequestParam(required = false) String da,
            @RequestParam(required = false) String a,
            @RequestParam(required = false) Integer min,
            @RequestParam(required = false) Integer max,
            @RequestParam(required = false) Integer minCosto,
            @RequestParam(required = false) Integer maxCosto,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {

        try{
            return magazzinoService.ricercaArticoli(nome, categoria, ubicazione, codice, da, a, min, max, minCosto, maxCosto,size,page * size);

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
        }catch (AlreadyExistsException e){
            return new ResponseDto(e.getMessage(), HttpStatus.BAD_REQUEST);
        }catch (Exception e){
            return new ResponseDto("Errore durante l'update della categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("Categoria modificata con successo", HttpStatus.OK);
    }

    @DeleteMapping("/deleteCategorie")
    public ResponseDto eliminaCategorie(@RequestBody Map<String, Integer> ids){

        try{
            magazzinoService.deleteCategorie(ids);
        }catch (Exception e){
            return new ResponseDto("Errore durante il delete della categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("categoria eliminato con successo", HttpStatus.OK);
    }

    @GetMapping("/ricercaCategorie")
    public EntityResponseDto ricercaCategorie(
            @RequestParam(required = false) String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size){

        try{
            return magazzinoService.getCategoria(categoria, size, page * size);
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/aggiungiCategoria")
    public ResponseDto aggiungiCategoria(@Valid @RequestBody CategoriaDto categoria){

        try{
            magazzinoService.addCategoria(categoria.getNome());
        }catch (Exception e){
            return new ResponseDto("Errore durante l'aggiunta della categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseDto("Categoria aggiunto con successo", HttpStatus.OK);
    }

}
