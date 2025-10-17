import { creaTabellaArticoli, createOptionMerce, createOptionCosto } from './gestioneMagazzino.js'
import { creaTabellaCategoria, creaTabellaUbicazione, creaTabellaMerce } from './categorie.js'

const API_BASE_URL = "/api/magazzino";

document.addEventListener("DOMContentLoaded", async () => {
    getCategorie("selectCategoria", "addCategoria");
    getCategorie("selectCategoriaInput", "categoriaInput");
    getUbicazione("selectUbicazione", "addUbicazione");
    getUbicazione("selectUbicazioneInput","ubicazioneInput");
    setDate();
    setDateSearch();
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.da, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize, filtri.sortField));
});


// --- Gestione navigazione ---
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-target');
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    if(target === "home"){
        form.reset();
        searchForm.reset();
        getCategorie("selectCategoria", "addCategoria");
        getCategorie("selectCategoriaInput", "categoriaInput");
        getUbicazione("selectUbicazione", "addUbicazione");
        getUbicazione("selectUbicazioneInput","ubicazioneInput");
        setDateSearch();
        setDate();
        const filtri = await creaFiltri();
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.da, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize, filtri.sortField));
    }
    if(target === "gestione"){
        getCategorie("selectCategoriaSearch","categoriaSearch");
        getUbicazione("selectUbicazioneSearch","ubicazioneSearch");
        const filtri = await creaFiltriCat();
        paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSizeCat));
        const filtriUb = await creaFiltriUb();
        paginazioneUb(await ricercaUbicazioni(filtriUb.nome, currentPageUb -1, pageSizeUb));
        const anno = await getYear();
        document.getElementById('pageInfoGr').innerText = anno;
        document.getElementById('compara').value = null;
        creaGrafico(anno);
        creaGraficoMerce(anno);
        creaTabellaMerce(await ricercaMerce(anno));
    }
  });
});

document.getElementById("compara").addEventListener('input', setComparazione)
async function setComparazione(){
    const annoComparato = document.getElementById("compara").value;
    const anno = parseInt(document.getElementById('pageInfoGr').innerText);
    creaGrafico(anno, annoComparato);
    creaGraficoMerce(anno, annoComparato);
}

async function getCategorie(elementId, inputCat){
    const select = document.getElementById(elementId);
    const categorie = await ricercaCategorieSelect(null, 0, 0);
    select.innerHTML = '<option value=""> Seleziona Categoria </option>';

    categorie.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.nome;
        option.textContent = cat.nome;
        select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
        const value = e.target.value;
        document.getElementById(inputCat).value = value;
    });
}

async function setDate(){
const data = document.getElementById("data");
const today = new Date();
const formatted = today.toISOString().split('T')[0];
data.value = formatted;
}

async function setDateSearch(){
const data_da = document.getElementById("data_da");
const data_a = document.getElementById("data_a");
const today = new Date();
const formatted = today.toISOString().split('T')[0];

const lastMonth = new Date(today);
lastMonth.setMonth(lastMonth.getMonth() - 1);
const formattedLast = lastMonth.toISOString().split('T')[0];
data_da.value = formattedLast;
data_a.value = formatted;
}

async function getYear(){
    const today = new Date();
    return today.getFullYear();
}

async function getUbicazione(elementId, inputUb){
    const select = document.getElementById(elementId);
    const ubicazioni = await ricercaUbicazioneSelect(null, 0, 0);
    select.innerHTML = '<option value=""> Seleziona Ubicazione </option>';

    ubicazioni.forEach(ub => {
        const option = document.createElement("option");
        option.value = ub.nome;
        option.textContent = ub.nome;
        select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
        const value = e.target.value;
        document.getElementById(inputUb).value = value;
    });
}

async function creaFiltri(){

    const nomeInput = document.getElementById("nomeInput").value.trim();
    const codiceInput = document.getElementById("codiceInput").value.trim();
    const categoriaInput = document.getElementById("categoriaInput").value.trim();
    const ubicazioneInput = document.getElementById("ubicazioneInput").value.trim();
    const dataDaInput = document.getElementById("data_da").value;
    const dataAInput = document.getElementById("data_a").value;
    const minInput = document.getElementById("minInput").value;
    const maxInput = document.getElementById("maxInput").value;
    const minCostoInput = document.getElementById("minCostoInput").value;
    const maxCostoInput = document.getElementById("maxCostoInput").value;
    const sortField = document.getElementById("selectSort").value;

    const filtri = {
        nome: nomeInput !== "" ? nomeInput : null,
        codice: codiceInput !== "" ? codiceInput : null,
        categoria: categoriaInput !== "" ? categoriaInput : null,
        ubicazione: ubicazioneInput !== "" ? ubicazioneInput : null,
        da: dataDaInput !== "" ? dataDaInput : null,
        a: dataAInput !== "" ? dataAInput : null,
        min: minInput !== "" ? minInput : null,
        max: maxInput !== "" ? maxInput : null,
        minCosto: minCostoInput !== "" ? minCostoInput : null,
        maxCosto: maxCostoInput !== "" ? maxCostoInput : null,
        sortField: sortField
    };

    return filtri;
}

async function creaFiltriCat(){
    const categoriaSearch = document.getElementById("categoriaSearch").value.trim();
    const filtri = { nome: categoriaSearch !== "" ? categoriaSearch : null }
    return filtri;
}

async function creaFiltriUb(){
    const ubicazioneSearch = document.getElementById("ubicazioneSearch").value.trim();
    const filtri = { nome: ubicazioneSearch !== "" ? ubicazioneSearch : null }
    return filtri;
}

//////// SEARCH FORM ///////////////
const searchForm = document.getElementById("ricercaForm");
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.da, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize, filtri.sortField));
});


const searchCategoriaForm = document.getElementById("cercaCategoriaForm");
searchCategoriaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const filtri = await creaFiltriCat();
    paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSizeCat));
});

const searchUbicazioneForm = document.getElementById("cercaUbicazioneForm");
searchUbicazioneForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const filtri = await creaFiltriUb();
    paginazioneUb(await ricercaUbicazioni(filtri.nome, currentPageUb -1, pageSizeUb));
});


/////// ADD FORM //////////////////////
const form = document.getElementById("addForm");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try{
        const articolo = {
            nome: document.getElementById("addNome").value.trim(),
            categoria: document.getElementById("addCategoria").value.trim(),
            ubicazione: document.getElementById("addUbicazione").value.trim(),
            dataInserimento: document.getElementById("data").value,
            quantita: parseInt(document.getElementById("addQuantita").value),
            costo: parseInt(document.getElementById("addCosto").value)
        }
        const res = await aggiungiArticolo(articolo);
        console.log(res.messaggio);
        const filtri = await creaFiltri();
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.da, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize, filtri.sortField));
        getCategorie("selectCategoria", "addCategoria");
        getCategorie("selectCategoriaInput", "categoriaInput");
        getUbicazione("modSelectUbicazione","modUbicazione");
        getUbicazione("selectUbicazioneInput","ubicazioneInput");
    }catch (err){
        const msg = err.message
        console.error("Errore nel salvataggio", msg);
        showToast(msg ,"warning", 5000);
    }
        form.reset();
        setDate();
});

const addCategoriaForm = document.getElementById("addCategoriaForm");
addCategoriaForm.addEventListener("submit" , async (e) => {
    e.preventDefault();
    try{
        const insertCategoria = document.getElementById("categoriaInsert").value.trim();
        const categoria = {
            nome: insertCategoria
        }

        const res = await aggiungiCategoria(categoria);
        console.log(res.messaggio);
        const filtri = await creaFiltriCat();
        paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSizeCat));
        getCategorie("selectCategoriaSearch","categoriaSearch");
    }catch(err){
        const msg = err.message
        console.error("Errore nel salvataggio", msg);
        showToast(msg, "warning", 5000)
    }

    addCategoriaForm.reset();
});


const addUbicazioneForm = document.getElementById("addUbicazioneForm");
addUbicazioneForm.addEventListener("submit" , async (e) => {
    e.preventDefault();
    try{
        const insertUbicazione = document.getElementById("ubicazioneInsert").value.trim();
        const ubicazione = {
            nome: insertUbicazione
        }

        const res = await aggiungiUbicazione(ubicazione);
        console.log(res.messaggio);
        const filtri = await creaFiltriUb();
        paginazioneUb(await ricercaUbicazioni(filtri.nome, currentPageUb -1, pageSizeUb));
        getUbicazione("selectUbicazioneSearch","ubicazioneSearch");
    }catch(err){
        const msg = err.message
        console.error("Errore nel salvataggio", msg);
        showToast(msg, "warning", 5000)
    }

    addUbicazioneForm.reset();
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

export async function aggiungiUbicazione(ubicazioneDto){

    const res = await fetch(`${API_BASE_URL}/aggiungiUbicazione`,{
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(ubicazioneDto)
    });

    if(!res.ok){
        const json = await res.json();
        const message = json.message;
        throw new Error(`${message}`);
    }

    return res.json();
}


///////////////// RICERCA ///////////////////////
export async function ricercaArticoli(nome, codice, categoria, ubicazione, da, a, min, max, minCosto, maxCosto, page = 0, size = 25, sortField){
    try{
        const labelRisultati = document.getElementById("totRisultati");
        const params = new URLSearchParams();
        if(nome) params.append("nome", nome);
        if(codice) params.append("codice", codice);
        if(categoria) params.append("categoria", categoria);
        if(ubicazione) params.append("ubicazione", ubicazione);
        if(da) params.append("da", da);
        if(a) params.append("a", a);
        if(min !== undefined && min !== null) params.append("min", min);
        if(max !== undefined && max !== null) params.append("max", max);
        if(minCosto !== undefined && minCosto !== null) params.append("minCosto", minCosto);
        if(maxCosto !== undefined && maxCosto !== null) params.append("maxCosto", maxCosto);
        params.append("page", page);
        params.append("size", size);
        if(sortField) params.append("sortField", sortField);

        const res = await fetch(`${API_BASE_URL}/ricerca?${params}`);
        const json = await res.json();
        const entity = json.entity;
        const risultati = json.count;
        creaTabellaArticoli(entity);
        labelRisultati.textContent = `Totale risultati: ${risultati}`;
        return risultati;
    }catch(err){
        console.error(err);
        showToast("Errore durante l'esecuzione della ricerca");
    }
}

export async function ricercaArticoliGraph(da, a, page = 0, size = 0){
    try{
        const params = new URLSearchParams();
        if(da) params.append("da", da);
        if(a) params.append("a", a);
        params.append("page", page);
        params.append("size", size);

        const res = await fetch(`${API_BASE_URL}/ricerca?${params}`);
        const json = await res.json();
        return json.entity;
    }catch(err){
        console.error(err)
        showToast("Errore durante l'esecuzione della ricerca");
    }
}


export async function ricercaCategorie(categoria, page = 0, size = 10){
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
        console.error(err);
        showToast("Errore durante l'esecuzione della ricerca");
    }
}

export async function ricercaCategorieSelect(categoria, page = 0, size = 0){
    try{
        const params = new URLSearchParams();
        if(categoria) params.append("categoria", categoria);
        params.append("page", page);
        params.append("size", size);

        const res = await fetch(`${API_BASE_URL}/ricercaCategorie?${params}`);
        const json = await res.json();
        return json.entity;
    }catch(err){
        console.error(err)
        showToast("Errore durante l'esecuzione della ricerca");
    }
}

async function ricercaMerce(anno){
    try{
        const params = new URLSearchParams();
        if(anno) params.append("anno", anno);

        const res = await fetch(`${API_BASE_URL}/ricercaMerce?${params}`);
        const json = await res.json();
        return json.entity;
    }catch(err){
        console.error(err);
        showToast("Errore durante l'esecuzione della ricerca");
    }
}

export async function ricercaUbicazioni(ubicazione, page = 0, size = 10){
    try{
        const labelUb = document.getElementById("risultatiUb");
        const params = new URLSearchParams();
        if(ubicazione) params.append("ubicazione", ubicazione);
        params.append("page", page);
        params.append("size", size);

        const res = await fetch(`${API_BASE_URL}/ricercaUbicazioni?${params}`);
        const json = await res.json();
        const entity = json.entity;
        const risultati = json.count;
        creaTabellaUbicazione(entity);
        labelUb.textContent = `Totale risultati: ${risultati}`;
        return risultati;
    }catch(err){
        console.error(err)
    }
}

export async function ricercaUbicazioneSelect(ubicazione, page = 0, size = 0){
    try{
        const params = new URLSearchParams();
        if(ubicazione) params.append("ubicazione", ubicazione);
        params.append("page", page);
        params.append("size", size);

        const res = await fetch(`${API_BASE_URL}/ricercaUbicazioni?${params}`);
        const json = await res.json();
        return json.entity;
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
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.da, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize, filtri.sortField));

    }catch(err){
        console.error('Errore', err.message);
    }
}

async function deleteCategoria(ids){
    try{
        const response = await fetch(`${API_BASE_URL}/deleteCategorie`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ids)
        });
        const data = await response.json();
        if(!response){
            throw new Error(data.message || 'Errore nella richiesta');
        }
        console.log(data.messaggio)
        const filtri = await creaFiltriCat();
        paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSizeCat));
    }catch(err){
        console.error(err);
    }
}

async function deleteUbicazione(ids){
    try{
        const response = await fetch(`${API_BASE_URL}/deleteUbicazioni`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ids)
        });
        const data = await response.json();
        if(!response){
            throw new Error(data.message || 'Errore nella richiesta');
        }
        console.log(data.messaggio)
        const filtri = await creaFiltriUb();
        paginazioneUb(await ricercaUbicazioni(filtri.nome, currentPageUb -1, pageSizeUb));
    }catch(err){
        console.error(err);
    }
}

///////// UPDATE ///////////////
async function updateArticolo(dto){
    try{
        const response = await fetch(`${API_BASE_URL}/update`,{
            method: 'PUT',
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(dto)
        });

        const data = await response.json();
        if(!response.ok){
            throw new Error(data.messaggio || 'Errore durante l\'update');
        }
        console.log(data.messaggio);
        const filtri = await creaFiltri();
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.da, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize, filtri.sortField));
    }catch(err){
        console.error(err);
    }
}

async function updateCategoria(oldCategoria, newName){
    try{
       const params = new URLSearchParams();
       params.append('oldCategoria', oldCategoria);
       params.append('newName', newName);
       const response = await fetch(`${API_BASE_URL}/updateCategoria?${params}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'}
       });

       const data = await response.json();
       if(!response.ok){
        throw new Error(data.messaggio || 'Errore nella richiesta')
       }
       console.log(data.messaggio);
       const filtri = await creaFiltriCat();
       paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSizeCat));

       return data;
    }catch(err){
        console.error(err);
    }
}

async function updateUbicazione(oldUbicazione, newName){
    try{
       const params = new URLSearchParams();
       params.append('oldUbicazione', oldUbicazione);
       params.append('newName', newName);
       const response = await fetch(`${API_BASE_URL}/updateUbicazione?${params}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'}
       });

       const data = await response.json();
       if(!response.ok){
        throw new Error(data.messaggio || 'Errore nella richiesta')
       }
       console.log(data.messaggio);
       const filtri = await creaFiltriUb();
       paginazioneUb(await ricercaUbicazioni(filtri.nome, currentPageUb -1, pageSizeUb));

       return data;
    }catch(err){
        console.error(err);
    }
}

async function updateMerce(dto){
    try{
       const response = await fetch(`${API_BASE_URL}/updateMerce`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dto)
       });

       const data = await response.json();
       if(!response.ok){
        throw new Error(data.messaggio || 'Errore nella richiesta')
       }
       console.log(data.messaggio);
       const merce = await ricercaMerce(dto.anno);
       creaTabellaMerce(merce);
       creaGraficoMerce(dto.anno);
       return data;
    }catch(err){
        console.error(err);
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
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.da, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize, filtri.sortField));
    }
});

nextBtn.addEventListener("click", async () => {
    currentPage++;
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.da, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize, filtri.sortField));
});

////////// PAGINAZIONE CATEGORIE //////////////
let currentPageCat = 1;
const pageSizeCat = 10;

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
        paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSizeCat));
    }
});

nextBtnCat.addEventListener("click", async () => {
    currentPageCat++;
    const filtri = await creaFiltriCat();
    paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSizeCat));
});

////////// PAGINAZIONE UBICAZIONE //////////////
let currentPageUb = 1;
const pageSizeUb = 10;

const prevBtnUb = document.getElementById("prevPageUb");
const nextBtnUb = document.getElementById("nextPageUb");
const pageInfoUb = document.getElementById("pageInfoUb");

function paginazioneUb(count){
    const pages = Math.ceil(count / pageSizeUb);
    pageInfoUb.innerText = `${currentPageUb} / ${pages}` ;

    prevBtnUb.disabled = currentPageUb === 1;
    nextBtnUb.disabled = currentPageUb >= pages;
}

prevBtnUb.addEventListener("click", async () => {
    if(currentPageUb > 0) {
        currentPageUb--;
        const filtri = await creaFiltriUb();
        paginazioneUb(await ricercaUbicazioni(filtri.nome, currentPageUb -1, pageSizeUb));
    }
});

nextBtnUb.addEventListener("click", async () => {
    currentPageUb++;
    const filtri = await creaFiltriUb();
    paginazioneUb(await ricercaUbicazioni(filtri.nome, currentPageUb -1, pageSizeUb));
});

////// PAGINAZIONE GRAFICI ///////////
let currentPageGr = parseInt(await getYear());

const prevBtnGr = document.getElementById("prevPageGr");
const nextBtnGr = document.getElementById("nextPageGr");
const pageInfoGr = document.getElementById("pageInfoGr");

prevBtnGr.addEventListener("click", async () => {
    currentPageGr--;
    pageInfoGr.innerText = `${currentPageGr}`;
    creaGrafico(currentPageGr);
    creaGraficoMerce(currentPageGr);
    creaTabellaMerce(await ricercaMerce(currentPageGr));
});

nextBtnGr.addEventListener("click", async () => {
    currentPageGr++;
    pageInfoGr.innerText = `${currentPageGr}`;
    creaGrafico(currentPageGr);
    creaGraficoMerce(currentPageGr);
    creaTabellaMerce(await ricercaMerce(currentPageGr));
});

////////  GET SELECTED ///////////
document.getElementById("deleteBtn").addEventListener('click', deleteArticoliChecked);
export async function deleteArticoliChecked(){
    const table = document.querySelector('#tabellaRicerca tbody');
    const righe = table.querySelectorAll('tr.selected');

    if (righe.length === 0) {
    showToast("Seleziona almeno una riga", "warning");
    return;
    }

    const ids = [];
    righe.forEach( riga =>{
        ids.push(riga.id);
    });
    await deleteArticoli(ids);
}

document.getElementById("deleteBtnCat").addEventListener('click', deleteCategorieChecked);
export async function deleteCategorieChecked(){
    const table = document.querySelector('#tabellaCategorie tbody');
    const righe = table.querySelectorAll('tr.selected');

    if (righe.length === 0) {
    showToast("Seleziona almeno una riga", "warning");
    return;
    }

    const ids = {};
    righe.forEach(riga =>{
        ids[riga.textContent.trim()] = parseInt(riga.id);
    });
    await deleteCategoria(ids);
    getCategorie("selectCategoriaSearch","categoriaSearch");
}

document.getElementById("deleteBtnUb").addEventListener('click', deleteUbicazioniChecked);
export async function deleteUbicazioniChecked(){
    const table = document.querySelector('#tabellaUbicazioni tbody');
    const righe = table.querySelectorAll('tr.selected');

    if (righe.length === 0) {
    showToast("Seleziona almeno una riga", "warning");
    return;
    }

    const ids = {};
    righe.forEach(riga =>{
        ids[riga.textContent.trim()] = parseInt(riga.id);
    });
    await deleteUbicazione(ids);
    getUbicazione("selectUbicazioneSearch","ubicazioneSearch");
}

document.getElementById("updateBtn").addEventListener('click', updateArticoliChecked);
let quantita;
async function updateArticoliChecked(){
    const table = document.querySelector('#tabellaRicerca tbody');
    const rigaSelected = table.querySelectorAll('tr.selected');

    if (rigaSelected.length === 0) {
    showToast("Seleziona una riga", "warning");
    return;
    }

    if (rigaSelected.length > 1) {
    showToast("Seleziona solo una riga", "warning");
    return;
    }

    const celle = rigaSelected[0].querySelectorAll('td');
    const id = rigaSelected[0].id;
    const richieste = rigaSelected[0].getAttribute("richieste");
    const nome = celle[0].innerText;
    const categoria = celle[1].innerText;
    const ubicazione = celle[2].innerText;
    const codice = celle[3].innerText;
    quantita = celle[4].innerText;
    const costo = celle[5].innerText;
    const data = celle[6].innerText;

    const [d,m,y] = data.split("/");
    const formatted = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;

    document.querySelector('#modNome').value = nome;
    document.querySelector('#modCategoria').value = categoria;
    document.querySelector('#modCodice').value = codice;
    document.querySelector('#modUbicazione').value = ubicazione;
    document.querySelector('#modQuantita').value = quantita;
    document.querySelector('#modCosto').value = costo;
    document.querySelector('#modData').value = formatted;
    document.querySelector('#modDataOperazione').value = formatted;

    getCategorie("modSelectCategoria","modCategoria");
    getUbicazione("modSelectUbicazione","modUbicazione");

    document.querySelector('#modaleUpdate').dataset.id = id;
    document.querySelector('#modaleUpdate').dataset.richieste = richieste;
    document.querySelector('#modaleUpdate').classList.remove('hidden');

    document.querySelector('#btnChiudiUpdate').addEventListener('click', () => {
        document.querySelector('#modaleUpdate').classList.add('hidden');
    });
}

document.querySelector('#btnSalvaUpdate').addEventListener('click', async () =>{
    const id = document.querySelector('#modaleUpdate').dataset.id;
    const richieste = document.querySelector('#modaleUpdate').dataset.richieste;
    const quantitaMod = Number(document.querySelector('#modQuantita').value);
    let updatedQuantita = false;
    if(Number(quantita) !== quantitaMod){
        updatedQuantita = true;
    }

    const articolo = {
        id: id,
        nome: document.querySelector('#modNome').value,
        categoria: document.querySelector('#modCategoria').value,
        ubicazione: document.querySelector('#modUbicazione').value,
        codice: document.querySelector('#modCodice').value,
        quantita: quantitaMod,
        costo: Number(document.querySelector('#modCosto').value),
        dataInserimento: document.querySelector('#modData').value,
        dataOperazione: document.querySelector('#modDataOperazione').value,
        richieste: richieste,
        updatedQuantita: updatedQuantita
    };

    await updateArticolo(articolo);
    document.querySelector('#modaleUpdate').classList.add('hidden');
});

document.getElementById("updateBtnCat").addEventListener('click', updateCategoriaChecked);
async function updateCategoriaChecked(){
    const table = document.querySelector('#tabellaCategorie tbody');
    const rigaSelected = table.querySelectorAll('tr.selected');

    if (rigaSelected.length === 0) {
    showToast("Seleziona una riga", "warning");
    return;
    }

    if (rigaSelected.length > 1) {
    showToast("Seleziona solo una riga", "warning");
    return;
    }

    document.getElementById("errorAlreadyExists").innerText = "";
    const celle = rigaSelected[0].querySelectorAll('td');
    const nome = celle[0].innerText;

    document.querySelector('#modNomeCat').value = nome;
    document.querySelector('#modaleUpdateCat').classList.remove('hidden');

    document.querySelector('#btnChiudiUpdateCat').addEventListener('click', () => {
        document.querySelector('#modaleUpdateCat').classList.add('hidden');
    });

    document.querySelector('#btnSalvaUpdateCat').addEventListener('click', async () =>{
        try{
            const newName = document.querySelector('#modNomeCat').value;
            const response = await updateCategoria(nome, newName);

            if(response.status != "BAD_REQUEST"){
                document.querySelector('#modaleUpdateCat').classList.add('hidden');
                getCategorie("selectCategoriaSearch","categoriaSearch");
            }else{
                document.getElementById("errorAlreadyExists").textContent = response.messaggio;
            }

        }catch(err){
            console.error(err);
        }
    });
}

document.getElementById("updateBtnUb").addEventListener('click', updateUbicazioneChecked);
async function updateUbicazioneChecked(){
    const table = document.querySelector('#tabellaUbicazioni tbody');
    const rigaSelected = table.querySelectorAll('tr.selected');

    if (rigaSelected.length === 0) {
    showToast("Seleziona una riga", "warning");
    return;
    }

    if (rigaSelected.length > 1) {
    showToast("Seleziona solo una riga", "warning");
    return;
    }

    document.getElementById("errorAlreadyExistsUb").innerText = "";
    const celle = rigaSelected[0].querySelectorAll('td');
    const nome = celle[0].innerText;

    document.querySelector('#modNomeUb').value = nome;
    document.querySelector('#modaleUpdateUb').classList.remove('hidden');

    document.querySelector('#btnChiudiUpdateUb').addEventListener('click', () => {
        document.querySelector('#modaleUpdateUb').classList.add('hidden');
    });

    document.querySelector('#btnSalvaUpdateUb').addEventListener('click', async () =>{
        try{
            const newName = document.querySelector('#modNomeUb').value;
            const response = await updateUbicazione(nome, newName);

            if(response.status != "BAD_REQUEST"){
                document.querySelector('#modaleUpdateUb').classList.add('hidden');
                getUbicazione("selectUbicazioneSearch","ubicazioneSearch");
            }else{
                document.getElementById("errorAlreadyExistsUb").textContent = response.messaggio;
            }

        }catch(err){
            console.error(err);
        }
    });
}
const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
document.getElementById("updateBtnMe").addEventListener('click', updateMerceChecked);
async function updateMerceChecked(){
    const table = document.querySelector('#tabellaMerce tbody');
        const rigaSelected = table.querySelectorAll('tr.selected');

        if (rigaSelected.length === 0) {
        showToast("Seleziona una riga", "warning");
        return;
        }

        if (rigaSelected.length > 1) {
        showToast("Seleziona solo una riga", "warning");
        return;
        }

        const celle = rigaSelected[0].querySelectorAll('td');
        const anno = rigaSelected[0].getAttribute("anno");
        const mese = celle[0].innerText;
        const entrata = celle[1].innerText;
        const uscita = celle[2].innerText;

        document.querySelector('#modEntrataMe').value = entrata;
        document.querySelector('#modUscitaMe').value = uscita;
        document.querySelector('#titoloMod').textContent = "Modifica Movimenti " + mese;
        document.querySelector('#modaleUpdateMe').classList.remove('hidden');
        document.querySelector('#modaleUpdateMe').dataset.anno = anno;
        document.querySelector('#modaleUpdateMe').dataset.mese = mese;

        document.querySelector('#btnChiudiUpdateMe').addEventListener('click', () => {
            document.querySelector('#modaleUpdateMe').classList.add('hidden');
        });

            document.querySelector('#btnSalvaUpdateMe').addEventListener('click', async () =>{
                try{
                    const mese = document.querySelector('#modaleUpdateMe').dataset.mese;
                    const meseIndex = (mesi.indexOf(mese) +1) + "";
                    const meseFormatted = meseIndex.padStart(2,'0');
                    const dto = {
                        entrata: document.querySelector('#modEntrataMe').value,
                        uscita: document.querySelector('#modUscitaMe').value,
                        anno: document.querySelector('#modaleUpdateMe').dataset.anno,
                        mese: meseFormatted
                    }

                    const response = await updateMerce(dto);

                    if(response.status != "BAD_REQUEST"){
                        document.querySelector('#modaleUpdateMe').classList.add('hidden');
                    }else{
                        showToast("Errore durarante l'update");
                    }

                }catch(err){
                    console.error(err);
                }
            });
}

export function showToast(message,type, time = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, time);
}

async function creaGrafico(anno, anno2){
    const echarts = window.echarts;
    const chart = echarts.init(document.getElementById("chart"));
    const data = await ricercaArticoliGraph(anno + "-01-01", anno + "-12-31", 0, 0);
    let data2;
    anno2 = document.getElementById("compara").value;
    if(anno2 !== undefined && anno2 !== null && anno !== parseInt(anno2)){
        data2 = await ricercaArticoliGraph(anno2 + "-01-01", anno2 + "-12-31", 0, 0);
    }
    const graph = await createOptionCosto(data, data2);
    chart.setOption(graph);
}

async function creaGraficoMerce(anno, anno2){
    const echarts = window.echarts;
    const chartMerce = echarts.init(document.getElementById("chartMerce"));
    const data = await ricercaMerce(anno);
    let data2;
    anno2 = document.getElementById("compara").value;
    if(anno2 !== undefined && anno2 !== null && anno !== parseInt(anno2)) data2 = await ricercaMerce(anno2);
    const graph = await createOptionMerce(data, data2);
    chartMerce.setOption(graph);
}