package com.ferramenta.magazzino.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import java.awt.Desktop;
import java.net.URI;

@Component
public class BrowserLauncher implements ApplicationListener<ApplicationReadyEvent> {

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        String port = event.getApplicationContext()
                .getEnvironment()
                .getProperty("server.port", "8080");

        String url = "http://localhost:" + port;

        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
                System.out.println("Browser aperto automaticamente su: " + url);
            } else {

                openBrowserFallback(url);
            }
        } catch (Exception e) {
            System.err.println("Impossibile aprire il browser automaticamente: " + e.getMessage());
            openBrowserFallback(url);
        }
    }

    private void openBrowserFallback(String url) {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            Runtime runtime = Runtime.getRuntime();

            if (os.contains("win")) {
                // Windows
                runtime.exec("rundll32 url.dll,FileProtocolHandler " + url);
                System.out.println("Browser aperto con rundll32 su: " + url);
            } else if (os.contains("mac")) {
                // macOS
                runtime.exec("open " + url);
                System.out.println("Browser aperto con open su: " + url);
            } else if (os.contains("nix") || os.contains("nux")) {
                // Linux
                runtime.exec("xdg-open " + url);
                System.out.println("Browser aperto con xdg-open su: " + url);
            } else {
                System.err.println("Sistema operativo non supportato per l'apertura automatica del browser");
                System.err.println("Apri manualmente il browser su: " + url);
            }
        } catch (Exception e) {
            System.err.println("Errore nel fallback di apertura browser: " + e.getMessage());
            System.err.println("Apri manualmente il browser su: " + url);
        }
    }
}