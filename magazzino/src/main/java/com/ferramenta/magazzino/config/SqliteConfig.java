package com.ferramenta.magazzino.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@Slf4j
public class SqliteConfig {

    @Value("${app.database.path}")
    private String dbFilePath;


    @PostConstruct
    public void initDatabaseFolder(){

        try{
            Path dbPath = Paths.get(dbFilePath).getParent();
            if(dbPath != null) {
                Files.createDirectories(dbPath);
                log.info("Cartella database creata o già esistente:  {}", dbPath.toAbsolutePath());
            }

            Path dbFile = Paths.get(dbFilePath);
            if(!Files.exists(dbFile)){
                log.info("Il file DB non esiste ancora e sarà creato da SQLite al primo accesso: {}", dbFile.toAbsolutePath());
            }

        } catch (IOException e) {
            log.error("Errore creazione cartella DB: {}", e.getMessage());
        }
    }
}
