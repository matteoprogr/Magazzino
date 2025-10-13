import { creaTabellaArticoli } from './gestioneMagazzino.js'
import { creaTabellaCategoria } from './categorie.js'

const API_BASE_URL = "/api/magazzino";


document.addEventListener("DOMContentLoaded", async () => {
    paginazione(await ricercaArticoli());
});


// --- Gestione navigazione ---
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-target');
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    if(target === "home"){
        paginazione(await ricercaArticoli());
    }
    if(target === "gestione"){
        paginazioneCat(await ricercaCategorie());
    }
  });
});

async function creaFiltri(){

    const nomeInput = document.getElementById("nomeInput").value.trim();
    const codiceInput = document.getElementById("codiceInput").value.trim();
    const categoriaInput = document.getElementById("categoriaInput").value.trim();
    const minInput = document.getElementById("minInput").value;
    const maxInput = document.getElementById("maxInput").value;

    const filtri = {
        nome: nomeInput !== "" ? nomeInput : null,
        codice: codiceInput !== "" ? codiceInput : null,
        categoria: categoriaInput !== "" ? categoriaInput : null,
        min: minInput !== "" ? minInput : null,
        max: maxInput !== "" ? maxInput : null
    };

    return filtri;
}

async function creaFiltriCat(){
    const categoriaSearch = document.getElementById("categoriaSearch").value.trim();
    const filtri = { nome: categoriaSearch !== "" ? categoriaSearch : null }
    return filtri;
}

//////// SEARCH FORM ///////////////
const searchForm = document.getElementById("ricercaForm");
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.min, filtri.max));
});


const searchCategoriaForm = document.getElementById("cercaCategoriaForm");
searchCategoriaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoriaSearch = document.getElementById("categoriaSearch").value.trim();
    const nome = categoriaSearch !== "" ? categoriaSearch : null;
    paginazioneCat(await ricercaCategorie(nome));
});


/////// ADD FORM //////////////////////
const form = document.getElementById("addForm");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const labelError = document.getElementById("validationError");

    try{
        const articolo = {
            nome: document.getElementById("addNome").value.trim(),
            categoria: document.getElementById("addCategoria").value.trim(),
            quantita: parseInt(document.getElementById("addQuantita").value)
        }
        labelError.textContent = "";
        const res = await aggiungiArticolo(articolo);
        console.log(res.messaggio);
        ricercaArticoli();
    }catch (err){
        const msg = err.message
        console.error("Errore nel salvataggio", err.message);
        labelError.textContent = msg;
    }
        form.reset();
});

const addCategoriaForm = document.getElementById("addCategoriaForm");
addCategoriaForm.addEventListener("submit" , async (e) => {
    e.preventDefault();
    const labelError = document.getElementById("validationErrorCategoria");

    try{
        labelError.textContent = "";
        const insertCategoria = document.getElementById("categoriaInsert").value.trim();
        const categoria = {
            nome: insertCategoria
        }

        const res = await aggiungiCategoria(categoria);
        console.log(res.messaggio);
        paginazioneCat(await ricercaCategorie());
    }catch(err){
        const msg = err.message
        console.error("Errore nel salvataggio", err.message);
        labelError.textContent = msg;
    }

    addCategoriaForm.reset();
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
        throw new Error(`${message}`);
    }

    return res.json();
}

export async function aggiungiCategoria(categoriaDto){

    const res = await fetch(`${API_BASE_URL}/aggiungiCategoria`,{
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(categoriaDto)
    });

    if(!res.ok){
        const json = await res.json();
        const message = json.message;
        throw new Error(`${message}`);
    }

    return res.json();
}


///////////////// RICERCA ///////////////////////
export async function ricercaArticoli(nome, codice, categoria, min, max, page = 0, size = 25){
    try{
        const labelRisultati = document.getElementById("totRisultati");
        const params = new URLSearchParams();
        if(nome) params.append("nome", nome);
        if(codice) params.append("codice", codice);
        if(categoria) params.append("categoria", categoria);
        if(min !== undefined && min !== null) params.append("min", min);
        if(max !== undefined && max !== null) params.append("max", max);
        params.append("page", page);
        params.append("size", size);

        const res = await fetch(`${API_BASE_URL}/ricerca?${params}`);
        const json = await res.json();
        const entity = json.entity;
        const risultati = json.count;
        creaTabellaArticoli(entity);
        labelRisultati.textContent = `Totale risultati: ${risultati}`;
        return risultati;
    }catch(err){
        console.error(err)
    }
}

///////// DELETE ARTICOLI /////////////
async function deleteArticoli(ids){
    try{
    const params = new URLSearchParams();
    ids.forEach(id => params.append('ids', id));

    const response = await fetch(`${API_BASE_URL}/delete?${params}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    console.log(data.messaggio)
    if(!response.ok){
        throw new Error(data.message || 'Errore durante il delete');
    }
    const filtri = creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.min, filtri.max));

    }catch(err){
        console.error('Errore', err.message);
    }
}

export async function ricercaCategorie(categoria, page = 0, size = 25){
    try{
        const labelCat = document.getElementById("risultatiCat");
        const params = new URLSearchParams();
        if(categoria) params.append("categoria", categoria);
        params.append("page", page);
        params.append("size", size);

        const res = await fetch(`${API_BASE_URL}/ricercaCategorie?${params}`);
        const json = await res.json();
        const entity = json.entity;
        const risultati = json.count;
        creaTabellaCategoria(entity);
        labelCat.textContent = `Totale risultati: ${risultati}`;
        return risultati;
    }catch(err){
        console.error(err)
    }
}

////////// PAGINAZIONE ARTICOLI //////////////
let currentPage = 1;
const pageSize = 25;

const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

function paginazione(count){
    const pages = Math.ceil(count / pageSize);
    pageInfo.innerText = `${currentPage} / ${pages}` ;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= pages;
}

prevBtn.addEventListener("click", async () => {
    if(currentPage > 0) {
        currentPage--;
        const filtri = await creaFiltri();
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.min, filtri.max, currentPage -1, pageSize));
    }
});

nextBtn.addEventListener("click", async () => {
    currentPage++;
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.min, filtri.max, currentPage -1, pageSize));
});

////////// PAGINAZIONE CATEGORIE //////////////
let currentPageCat = 1;
const pageSizeCat = 25;

const prevBtnCat = document.getElementById("prevPageCat");
const nextBtnCat = document.getElementById("nextPageCat");
const pageInfoCat = document.getElementById("pageInfoCat");

function paginazioneCat(count){
    const pages = Math.ceil(count / pageSizeCat);
    pageInfoCat.innerText = `${currentPageCat} / ${pages}` ;

    prevBtnCat.disabled = currentPageCat === 1;
    nextBtnCat.disabled = currentPageCat >= pages;
}

prevBtnCat.addEventListener("click", async () => {
    if(currentPageCat > 0) {
        currentPageCat--;
        const filtri = await creaFiltriCat();
        paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSize));
    }
});

nextBtnCat.addEventListener("click", async () => {
    currentPageCat++;
    const filtri = await creaFiltriCat();
    paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSize));
});

////////  GET CHECKED ///////////
document.getElementById("deleteBtn").addEventListener('click', getArticoliChecked);
export async function getArticoliChecked(){
    const table = document.querySelector('#tabellaRicerca tbody');
    const righe = table.querySelectorAll('tr.selected');
    const ids = [];
    righe.forEach( riga =>{
        ids.push(riga.id);
    });
    await deleteArticoli(ids);
}