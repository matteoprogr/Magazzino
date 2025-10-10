import { creaTabellaArticoli } from './gestioneMagazzino.js'
import { creaTabellaCategoria } from './categorie.js'

const API_BASE_URL = "/api/magazzino";



// --- Gestione navigazione ---
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.getAttribute('data-target');
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    if(target === "home"){
        ricercaArticoli();
    }
  });
});

const searchForm = document.getElementById("ricercaForm");
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nomeInput = document.getElementById("nomeInput").value.trim();
    const codiceInput = document.getElementById("codiceInput").value.trim();
    const categoriaInput = document.getElementById("categoriaInput").value.trim();
    const minInput = document.getElementById("minInput").value;
    const maxInput = document.getElementById("maxInput").value;
    const nome = nomeInput !== "" ? nomeInput : null;
    const codice = codiceInput !== "" ? codiceInput : null;
    const categoria = categoriaInput !== "" ? categoriaInput : null;
    const min = minInput !== "" ? minInput : null;
    const max = maxInput !== "" ? maxInput : null;
    ricercaArticoli(nome, codice, categoria, min, max);
})

const form = document.getElementById("addForm");
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const articolo = {
        nome: document.getElementById("addNome").value.trim(),
        categoria: document.getElementById("addCategoria").value.trim(),
        quantita: parseInt(document.getElementById("addQuantita").value)
    }
    try{
        const res = await aggiungiArticolo(articolo);
        console.log(res.messaggio);
        ricercaArticoli();
    }catch (err){
        const msg = err.message
        console.error("Errore nel salvataggio", err.message);
    }
        form.reset();
});

/////////////// AGGIUNGI //////////////////////
export async function aggiungiArticolo(dto){

    const res = await fetch(`${API_BASE_URL}/aggiungi`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(dto)
    });

    if(!res.ok){
        const json = await res.json();
        const message = json.message;
        throw new Error(`Errore HTTP ${res.status}: ${message}`);
    }

    return res.json();
}

export async function aggiungiCategoria(nomeCategoria){
    const params = new URLSearchParams({ categoria: nomeCategoria });
    const res = await fetch(`${API_BASE_URL}/aggiungiCategoria?${params}`,{
        method: "POST"
    });
    return res.json();
}


///////////////// RICERCA ///////////////////////
export async function ricercaArticoli(nome, codice, categoria, min, max, page = 0, size = 10){
    try{
        const params = new URLSearchParams();
        if(nome) params.append("nome", nome);
        if(codice) params.append("codice", codice);
        if(categoria) params.append("categoria", categoria);
        if(min !== undefined && min !== null) params.append("min", min);
        if(max !== undefined && max !== null) params.append("max", max);
        params.append("page", page);
        params.append("size", size);

        const res = await fetch(`${API_BASE_URL}/ricerca?${params}`);
        creaTabellaArticoli( await res.json());
    }catch(err){
        console.error(err)
    }

}

