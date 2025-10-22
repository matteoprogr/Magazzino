package com.ferramenta.magazzino.repository;

import com.ferramenta.magazzino.entity.Articolo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class ArticoliRepositoryImpl implements ArticoliRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Articolo> searchArticoliEntity(
            String nome,
            String categoria,
            String ubicazione,
            String codice,
            String da,
            String a,
            String daM,
            String aM,
            Integer minQuantita,
            Integer maxQuantita,
            Integer minCosto,
            Integer maxCosto,
            int limit,
            int offset,
            String orderBy,
            String direction
    ) {
        StringBuilder sql = new StringBuilder("SELECT * FROM articolo WHERE is_active = 1");
        List<String> conditions = new ArrayList<>();

        // Costruisci dinamicamente i filtri solo se i parametri sono valorizzati
        if (nome != null && !nome.isEmpty()) conditions.add("LOWER(nome) LIKE LOWER(CONCAT('%', :nome, '%'))");
        if (categoria != null && !categoria.isEmpty()) conditions.add("LOWER(categoria) LIKE LOWER(CONCAT('%', :categoria, '%'))");
        if (ubicazione != null && !ubicazione.isEmpty()) conditions.add("LOWER(ubicazione) LIKE LOWER(CONCAT('%', :ubicazione, '%'))");
        if (codice != null && !codice.isEmpty()) conditions.add("LOWER(codice) LIKE LOWER(CONCAT('%', :codice, '%'))");

        if (minQuantita != null) conditions.add("quantita >= :minQuantita");
        if (maxQuantita != null) conditions.add("quantita <= :maxQuantita");

        if (minCosto != null) conditions.add("costo >= :minCosto");
        if (maxCosto != null) conditions.add("costo <= :maxCosto");

        if (da != null && !da.isEmpty()) conditions.add("data_inserimento >= :da");
        if (a != null && !a.isEmpty()) conditions.add("data_inserimento <= :a");

        if (daM != null && !daM.isEmpty()) conditions.add("data_modifica >= :daM");
        if (aM != null && !aM.isEmpty()) conditions.add("data_modifica <= :aM");

        // Aggiungi le condizioni alla query
        if (!conditions.isEmpty()) {
            sql.append(" AND ").append(String.join(" AND ", conditions));
        }

        // Costruisci ORDER BY dinamico
        if (orderBy != null) {
            sql.append(" ORDER BY ").append(sanitizeColumn(orderBy)).append(" ");
            sql.append("DESC".equalsIgnoreCase(direction) ? "DESC " : "ASC ");
        }

        sql.append(" LIMIT :limit OFFSET :offset");

        Query query = entityManager.createNativeQuery(sql.toString(), Articolo.class);

        // Imposta solo i parametri realmente presenti
        if (nome != null && !nome.isEmpty()) query.setParameter("nome", nome);
        if (categoria != null && !categoria.isEmpty()) query.setParameter("categoria", categoria);
        if (ubicazione != null && !ubicazione.isEmpty()) query.setParameter("ubicazione", ubicazione);
        if (codice != null && !codice.isEmpty()) query.setParameter("codice", codice);

        if (minQuantita != null) query.setParameter("minQuantita", minQuantita);
        if (maxQuantita != null) query.setParameter("maxQuantita", maxQuantita);

        if (minCosto != null) query.setParameter("minCosto", minCosto);
        if (maxCosto != null) query.setParameter("maxCosto", maxCosto);

        if (da != null && !da.isEmpty()) query.setParameter("da", da);
        if (a != null && !a.isEmpty()) query.setParameter("a", a);

        if (daM != null && !daM.isEmpty()) query.setParameter("daM", daM);
        if (aM != null && !aM.isEmpty()) query.setParameter("aM", aM);

        query.setParameter("limit", limit);
        query.setParameter("offset", offset);

        return query.getResultList();
    }

    /**
     * Metodo di sicurezza per evitare SQL injection sul nome colonna.
     */
    private String sanitizeColumn(String orderBy) {
        return switch (orderBy.toLowerCase()) {
            case "nome" -> "nome";
            case "categoria" -> "categoria";
            case "quantita" -> "quantita";
            case "costo" -> "costo";
            case "richieste" -> "richieste";
            case "ubicazione" -> "ubicazione";
            case "unita" -> "costo_unita";
            case "valore" -> "valore";
            case "inserimento" -> "data_inserimento";
            case "modifica" -> "data_modifica";
            case "codice" -> "codice";
            default -> "id";
        };
    }
}
