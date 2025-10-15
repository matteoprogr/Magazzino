import { creaTabellaArticoli, createOption, attachLegendHandler } from './gestioneMagazzino.js'
import { creaTabellaCategoria } from './categorie.js'

const API_BASE_URL = "/api/magazzino";


document.addEventListener("DOMContentLoaded", async () => {
    getCategorie("selectCategoria", "addCategoria")
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.data, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize));

});


// --- Gestione navigazione ---
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-target');
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    if(target === "home"){
        getCategorie("selectCategoria", "addCategoria");
        const filtri = await creaFiltri();
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.data, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize));

    }
    if(target === "gestione"){
        const filtri = await creaFiltriCat();
        paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSize));
        creaGrafico();
    }
  });
});

async function getCategorie(elementId, inputCat){
    const select = document.getElementById(elementId);
    const categorie = await ricercaCategorieSelect(null, 0, 0);
    select.innerHTML = '<option value=""> Seleziona categoria </option>';

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
        maxCosto: maxCostoInput !== "" ? maxCostoInput : null
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
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.data, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize));
});


const searchCategoriaForm = document.getElementById("cercaCategoriaForm");
searchCategoriaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const filtri = await creaFiltriCat();
    paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSize));
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
            ubicazione: document.getElementById("addUbicazione").value.trim(),
            dataInserimento: document.getElementById("data").value,
            quantita: parseInt(document.getElementById("addQuantita").value),
            costo: parseInt(document.getElementById("addCosto").value)
        }
        labelError.textContent = "";
        const res = await aggiungiArticolo(articolo);
        console.log(res.messaggio);
        const filtri = await creaFiltri();
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.data, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize));
        getCategorie("selectCategoria", "addCategoria");
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
        const filtri = await creaFiltriCat();
        paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSize));
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
export async function ricercaArticoli(nome, codice, categoria, ubicazione, data, a, min, max, minCosto, maxCosto, page = 0, size = 25){
    try{
        const labelRisultati = document.getElementById("totRisultati");
        const params = new URLSearchParams();
        if(nome) params.append("nome", nome);
        if(codice) params.append("codice", codice);
        if(categoria) params.append("categoria", categoria);
        if(ubicazione) params.append("ubicazione", ubicazione);
        if(data) params.append("da", da);
        if(data) params.append("a", a);
        if(min !== undefined && min !== null) params.append("min", min);
        if(max !== undefined && max !== null) params.append("max", max);
        if(minCosto !== undefined && minCosto !== null) params.append("minCosto", minCosto);
        if(maxCosto !== undefined && maxCosto !== null) params.append("maxCosto", maxCosto);
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

export async function ricercaArticoliGraph(page = 0, size = 0){
    try{
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("size", size);

        const res = await fetch(`${API_BASE_URL}/ricerca?${params}`);
        const json = await res.json();
        return json.entity;
    }catch(err){
        console.error(err)
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
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.data, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize));

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
        paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSize));
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
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.data, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize));
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
       paginazioneCat(await ricercaCategorie(filtri.nome, currentPageCat -1, pageSize));

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
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.data, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize));
    }
});

nextBtn.addEventListener("click", async () => {
    currentPage++;
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.ubicazione, filtri.data, filtri.a, filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,currentPage -1, pageSize));
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
}

document.getElementById("updateBtn").addEventListener('click', updateArticoliChecked);
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
    const nome = celle[0].innerText;
    const categoria = celle[1].innerText;
    const ubicazione = celle[2].innerText;
    const codice = celle[3].innerText;
    const quantita = celle[4].innerText;
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

    getCategorie("modSelectCategoria","modCategoria");

    document.querySelector('#modaleUpdate').dataset.id = id;
    document.querySelector('#modaleUpdate').classList.remove('hidden');

    document.querySelector('#btnChiudiUpdate').addEventListener('click', () => {
        document.querySelector('#modaleUpdate').classList.add('hidden');
    });
}

document.querySelector('#btnSalvaUpdate').addEventListener('click', async () =>{
    const id = document.querySelector('#modaleUpdate').dataset.id;
    const articolo = {
        id: id,
        nome: document.querySelector('#modNome').value,
        categoria: document.querySelector('#modCategoria').value,
        ubicazione: document.querySelector('#modUbicazione').value,
        codice: document.querySelector('#modCodice').value,
        quantita: Number(document.querySelector('#modQuantita').value),
        costo: Number(document.querySelector('#modCosto').value),
        dataInserimento: document.querySelector('#modData').value
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
            }else{
                document.getElementById("errorAlreadyExists").textContent = response.messaggio;
            }

        }catch(err){
            console.error(err);
        }
    });
}

export function showToast(message,type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

async function creaGrafico(){
    const echarts = window.echarts;
    const chartTorta = echarts.init(document.getElementById("chart"));
    const data = await ricercaArticoliGraph(0, 0);
    const graph = await createOption(data);
    chartTorta.setOption(graph);
    attachLegendHandler(chartTorta);
}