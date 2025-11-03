import { creaTabellaArticoli, createOptionMerce, createOptionCosto } from './gestioneMagazzino.js'
import { creaTabellaCategoria, creaTabellaUbicazione, creaTabellaMerce, creaTabellaValore, creaComponentSottoCategoria } from './categorie.js'

const API_BASE_URL = "/api/magazzino";

document.addEventListener("DOMContentLoaded", async () => {
    getCategorie("selectCategoria", "addCategoria", "sottoCatDiv","addSottoCategoria", "selectSottoCategoria");
    getCategorie("selectCategoriaInput", "categoriaInput", "sottoCatDivSearch", null,"selectSottoCategoriaSearch");
    getUbicazione("selectUbicazione", "addUbicazione");
    getUbicazione("selectUbicazioneInput","ubicazioneInput");
    setDateSearch();
    configurazioneSortIndicator();
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria,filtri.sottoCategorie, filtri.ubicazione,
                                      filtri.da, filtri.a, filtri.daM, filtri.aM,
                                      filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                      currentPage -1, pageSize, filtri.sortField, "DESC"));
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
        await setOption("sottoCatDiv", "addSottoCategoria", "selectSottoCategoria",null, null, "addCategoria");
        await setOption("sottoCatDivSearch", null, "selectSottoCategoriaSearch",null, null, "categoriaInput");
        getCategorie("selectCategoria", "addCategoria", "sottoCatDiv","addSottoCategoria", "selectSottoCategoria");
        getCategorie("selectCategoriaInput", "categoriaInput", "sottoCatDivSearch", null,"selectSottoCategoriaSearch");
        getUbicazione("selectUbicazione", "addUbicazione");
        getUbicazione("selectUbicazioneInput","ubicazioneInput");
        setDateSearch();
        resetFiltri();
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
        creaTabellaValore(await ricercaArticoliGraph(anno));
        currentPageGr = anno;
    }
    if(target === "chiudi"){
        navigator.sendBeacon('/api/shutdown');
        setTimeout(() => {
            window.close();
        }, 100);
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

async function getCategorie(elementId, inputCat, div, input, selectSottoCategoria, modCat){
    const select = document.getElementById(elementId);
    const categorie = await ricercaCategorieSelect(null, 0, 0);
    select.innerHTML = '<option value=""> Seleziona Categoria </option>';

    categorie.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.nome;
        option.textContent = cat.nome;
        select.appendChild(option);
    });

    if(modCat !== null && modCat !== undefined){
        setOption(div, input, selectSottoCategoria, modCat, null, inputCat);
    }

    if(!select.dataset.listerAttached){
        select.addEventListener("change", async (e) => {
            setOption(div, input, selectSottoCategoria,null, e, inputCat);
        });
        select.dataset.listenerAttached = "true";
    }

}

async function setOption(div, input, selectSottoCategoria, modCat, e, inputCat){
    let value;
    if(e !== null && e !== undefined){
        value = e.target.value;
    }else if (modCat !== null){
        value = modCat;
    }else{
        value = "";
    }

    document.getElementById(inputCat).value = value;
    let stc = [];
    if(value !== ""){
        let cat = await ricercaCategorieSelect(value);
        if(cat.length > 0){
            stc = cat[0].sottoCategorie;
        }
    }

    const selectStc = document.getElementById(selectSottoCategoria);
    selectStc.innerHTML = "";
    selectStc.innerHTML = '<option value=""> Seleziona sotto categoria</option>';
    if(stc !== null && stc.length > 0){
        stc.forEach(s => {
            const option = document.createElement("option");
            option.value = s;
            option.innerText = s;
            selectStc.appendChild(option);
        });
    }

    if(modCat === null) document.getElementById(div).innerHTML = "";
    if (!selectStc.dataset.listenerAttached) {
        selectStc.addEventListener("change", async (e) => {
            const value = e.target.value;
            if (value.trim() !== "") addSottoCategoria(value, div, input);
        });
        selectStc.dataset.listenerAttached = "true";
    }
}

async function setDateSearch(){
    const data_daModifica = document.getElementById("dataM_da");
    const data_aModifica = document.getElementById("dataM_a");
    const today = new Date();

    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatted = formatLocalDate(today);

    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const formattedLast = formatLocalDate(lastMonth);

    data_daModifica.value = formattedLast;
    data_aModifica.value = formatted;
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
    const dataDaInputM = document.getElementById("dataM_da").value;
    const dataAInputM = document.getElementById("dataM_a").value;
    const minInput = document.getElementById("minInput").value;
    const maxInput = document.getElementById("maxInput").value;
    const minCostoInput = document.getElementById("minCostoInput").value;
    const maxCostoInput = document.getElementById("maxCostoInput").value;
    const activeHeader = document.querySelector('#tabellaRicerca th.active');
    let sortField = "";
    let direzione = "";
    if(activeHeader){
      sortField = activeHeader.dataset.col;
      direzione = activeHeader.querySelector('.sort-indicator').textContent === '▲' ? 'ASC' : 'DESC';
    }
    const stc = document.getElementById("sottoCatDivSearch").querySelectorAll(".cardLabel");
    const sot = [];
    if(stc.length > 0){
        stc.forEach( s =>{
            sot.push(s.innerText);
        });
    }

    const filtri = {
        nome: nomeInput !== "" ? nomeInput : null,
        codice: codiceInput !== "" ? codiceInput : null,
        categoria: categoriaInput !== "" ? categoriaInput : null,
        sottoCategorie: sot,
        ubicazione: ubicazioneInput !== "" ? ubicazioneInput : null,
        da: dataDaInput !== "" ? dataDaInput : null,
        a: dataAInput !== "" ? dataAInput : null,
        daM: dataDaInputM !== "" ? dataDaInputM : null,
        aM: dataAInputM !== "" ? dataAInputM : null,
        min: minInput !== "" ? minInput : null,
        max: maxInput !== "" ? maxInput : null,
        minCosto: minCostoInput !== "" ? minCostoInput : null,
        maxCosto: maxCostoInput !== "" ? maxCostoInput : null,
        sortField: sortField !== "" ? sortField : "richieste",
        direzione: direzione !== "" ? direzione : "DESC"
    };

    return filtri;
}
const reset = document.getElementById("reset").addEventListener('click', resetFiltri);
async function resetFiltri(){
    const headers = document.querySelectorAll('#tabellaRicerca th');
    headers.forEach(th => {
        const indicator = th.querySelector(".sort-indicator");
        th.classList.remove("active");
        indicator.textContent = '▲';
    });
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria,filtri.sottoCategorie, filtri.ubicazione,
                                          filtri.da, filtri.a, filtri.daM, filtri.aM,
                                          filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                          currentPage -1, pageSize, filtri.sortField, filtri.direzione));
}

async function configurazioneSortIndicator(){
    const headers = document.querySelectorAll('#tabellaRicerca th');
    let currentSort = {col: null, dir: "DESC"};
    headers.forEach(th => {
        th.addEventListener('click', async () =>{
            const col = th.dataset.col;
            let dir = "DESC";
            if(currentSort.col === col && currentSort.dir === "DESC"){
                dir = "ASC";
            }
            currentSort = {col,dir};
            updateSortIndicators(headers, currentSort);
            const filtri = await creaFiltri();
            paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria,filtri.sottoCategorie, filtri.ubicazione,
                                                  filtri.da, filtri.a, filtri.daM, filtri.aM,
                                                  filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                                  currentPage -1, pageSize, filtri.sortField, filtri.direzione));
        });
    });
    updateSortIndicators(headers, currentSort,reset);
}

function updateSortIndicators(headers, currentSort){
    headers.forEach(th => {
        const indicator = th.querySelector(".sort-indicator");
        if(th.dataset.col === currentSort.col){
            th.classList.add("active");
            indicator.textContent = currentSort.dir === 'DESC' ? '▼' : '▲';
        }else{
            th.classList.remove("active");
            indicator.textContent = '▲';
        }
    });
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
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.sottoCategorie, filtri.ubicazione,
                                      filtri.da, filtri.a, filtri.daM, filtri.aM,
                                      filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                      0, pageSize, filtri.sortField, filtri.direzione));
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

document.getElementById("btnAddStc").addEventListener('click', (e) => {
   e.preventDefault();
   addSottoCategoria(null, "sottoCatDiv", "addSottoCategoria");
});

document.getElementById("btnAddStcMod").addEventListener('click', (e) => {
   e.preventDefault();
   addSottoCategoria(null, "sottoCatDivMod", "addSottoCategoriaMod");
});

async function addSottoCategoria(value, div, input){
    let stcValue;
    const stc = document.getElementById(input);
    if(value == null){
        stcValue = stc.value.toLowerCase();
    }else{
        stcValue = value.toLowerCase();
    }


    if(isValid(stc) && !isValid(stc.value) && !isValid(stcValue)) return;
    const sottoCatDiv = document.getElementById(div);
    const elements = sottoCatDiv.querySelectorAll(".cardLabel");
    let exist = false;
    elements.forEach(el =>{
        if(el.innerText === stcValue){ exist = true; }
    });
    if(exist && stc){
        stc.value = "";
        return;
    }
    const container = document.createElement("div");
       container.innerHTML = `
         <div class="cardStc">
           <span class="cardLabel">${stcValue}</span>
           <button type="button" " class="cardBtn">x</button>
         </div>
       `;
       sottoCatDiv.appendChild(container);
       if(value == null) stc.value = "";
       container.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          container.remove();
          return false;
        });
}


/////// ADD FORM //////////////////////
const form = document.getElementById("addForm");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sottoList = [];
    const sottoCat = form.querySelectorAll(".cardLabel");
    sottoCat.forEach(stc =>{
        const sottoCategoria = stc.innerText;
        sottoList.push(sottoCategoria);
    });
    try{
        const articolo = {
            nome: document.getElementById("addNome").value.trim(),
            categoria: document.getElementById("addCategoria").value.trim(),
            sottoCategorie: sottoList,
            ubicazione: document.getElementById("addUbicazione").value.trim(),
            quantita: parseInt(document.getElementById("addQuantita").value),
            costo: parseFloat(document.getElementById("addCosto").value)
        }
        const res = await aggiungiArticolo(articolo);
        console.log(res.messaggio);
        form.reset();
        document.getElementById("sottoCatDiv").innerHTML = "";
        const filtri = await creaFiltri();
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.sottoCategorie, filtri.ubicazione,
                                          filtri.da, filtri.a, filtri.daM, filtri.aM,
                                          filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                          currentPage -1, pageSize, filtri.sortField, filtri.direzione));

        getCategorie("selectCategoria", "addCategoria", "sottoCatDiv","addSottoCategoria", "selectSottoCategoria");
        getCategorie("selectCategoriaInput", "categoriaInput", "sottoCatDivSearch", null,"selectSottoCategoriaSearch");
        getUbicazione("modSelectUbicazione","modUbicazione");
        getUbicazione("selectUbicazioneInput","ubicazioneInput");
    }catch (err){
        const msg = err.message
        console.error("Errore nel salvataggio", msg);
        showToast(msg ,"warning", 5000);
        return;
    }
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
export async function ricercaArticoli(nome, codice, categoria, sottoCategorie, ubicazione, da, a, daM, aM, min, max, minCosto, maxCosto,
                                      page = 0, size = 25, sortField, direzione = "DESC"){
    try{
        const labelRisultati = document.getElementById("totRisultati");
        const params = new URLSearchParams();
        if(nome) params.append("nome", nome);
        if(codice) params.append("codice", codice);
        if(categoria) params.append("categoria", categoria);
        if(sottoCategorie) params.append("sottoCategorie", sottoCategorie);
        if(ubicazione) params.append("ubicazione", ubicazione);
        if(da) params.append("da", da);
        if(a) params.append("a", a);
        if(daM) params.append("daM", daM);
        if(aM) params.append("aM", aM);
        if(min !== undefined && min !== null) params.append("min", min);
        if(max !== undefined && max !== null) params.append("max", max);
        if(minCosto !== undefined && minCosto !== null) params.append("minCosto", minCosto);
        if(maxCosto !== undefined && maxCosto !== null) params.append("maxCosto", maxCosto);
        params.append("page", page);
        params.append("size", size);
        if(sortField) params.append("sortField", sortField);
        params.append("direzione", direzione);

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

export async function ricercaArticoliGraph(anno){
    try{
        const params = new URLSearchParams();
        if(anno) params.append("anno", anno);

        const res = await fetch(`${API_BASE_URL}/ricercaGrafico?${params}`);
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
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria,filtri.sottoCategorie, filtri.ubicazione,
                                      filtri.da, filtri.a, filtri.daM, filtri.aM,
                                      filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                      currentPage -1, pageSize, filtri.sortField, filtri.direzione));

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
            console.error(data.message || 'Errore durante richiesta');
            return data;
        }
        console.log(data.messaggio);
        const filtri = await creaFiltri();
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.sottoCategorie, filtri.ubicazione,
                                          filtri.da, filtri.a, filtri.daM, filtri.aM,
                                          filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                          currentPage -1, pageSize, filtri.sortField, filtri.direzione));
        return data;
    }catch(err){
        console.error(err);
    }
}

async function updateCategoria(oldCategoria, newName, newStc){
    try{
       const params = new URLSearchParams();
       params.append('oldCategoria', oldCategoria);
       params.append('newName', newName);
       params.append('newStc', newStc);
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
        paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.sottoCategorie, filtri.ubicazione,
                                          filtri.da, filtri.a, filtri.daM, filtri.aM,
                                          filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                          currentPage -1, pageSize, filtri.sortField, filtri.direzione));
    }
});

nextBtn.addEventListener("click", async () => {
    currentPage++;
    const filtri = await creaFiltri();
    paginazione(await ricercaArticoli(filtri.nome, filtri.codice, filtri.categoria, filtri.sottoCategorie, filtri.ubicazione,
                                      filtri.da, filtri.a, filtri.daM, filtri.aM,
                                      filtri.min, filtri.max, filtri.minCosto, filtri.maxCosto,
                                      currentPage -1, pageSize, filtri.sortField, filtri.direzione));
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
    creaGrafico(currentPageGr, null, "indietro");
    creaGraficoMerce(currentPageGr);
    creaTabellaMerce(await ricercaMerce(currentPageGr));
    creaTabellaValore(await ricercaArticoliGraph(currentPageGr));
});

nextBtnGr.addEventListener("click", async () => {
    currentPageGr++;
    pageInfoGr.innerText = `${currentPageGr}`;
    creaGrafico(currentPageGr, null, "avanti");
    creaGraficoMerce(currentPageGr);
    creaTabellaMerce(await ricercaMerce(currentPageGr));
    creaTabellaValore(await ricercaArticoliGraph(currentPageGr));
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
        const cat = riga.innerText.split("[")[0].trim();
        ids[cat] = parseInt(riga.id);
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


async function setDate(date, dataValue){
const data = document.getElementById(date);
const today = new Date();
const formatted = today.toISOString().split('T')[0];
if(formatted >= dataValue){
    data.value = formatted;
    return formatted;
}else{
    data.value = dataValue;
    return dataValue;
}
}

document.getElementById("updateBtn").addEventListener('click', updateArticoliChecked);
let quantita;
let costo;
let costoUnita;
let dataOdierna;
let formattedM;
async function updateArticoliChecked(){
    const table = document.querySelector('#tabellaRicerca tbody');
    const rigaSelected = table.querySelectorAll('tr.selected');
    document.getElementById("error").textContent = "";
    document.getElementById("sottoCatDivMod").innerHTML = "";

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
    const idArticolo = rigaSelected[0].getAttribute("idArticolo");
    const nome = celle[0].innerText;
    const elementsCat = celle[1].innerText.split("[") ;
    const categoria = elementsCat[0].trim();
    if(elementsCat.length > 1){
        const stcs = elementsCat[1].replaceAll("]","").trim().split("\n");
        stcs.forEach(stc =>{
            addSottoCategoria(stc, "sottoCatDivMod", null)
        });
    }

    const ubicazione = celle[2].innerText;
    const codice = celle[3].innerText;
    quantita = celle[4].innerText;
    costo = celle[5].innerText;
    costoUnita = celle[6].innerText;
    const data = celle[8].innerText;
    const dataM = celle[9].innerText;

    const [d,m,y] = data.split("/");
    const formatted = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    const [dM,mM,yM] = dataM.split("/");
    formattedM = `${yM}-${mM.padStart(2,'0')}-${dM.padStart(2,'0')}`;

    document.querySelector('#modNome').value = nome;
    document.querySelector('#modCategoria').value = categoria;
    document.querySelector('#addSottoCategoriaMod').value = "";
    document.querySelector('#modCodice').value = codice;
    document.querySelector('#modUbicazione').value = ubicazione;
    document.querySelector('#modQuantita').value = quantita;
    document.querySelector('#modCosto').value = costo;
    document.querySelector('#modData').value = formatted;
    dataOdierna = await setDate("modDataModifica", formattedM);

    getCategorie("modSelectCategoria","modCategoria", "sottoCatDivMod","addSottoCategoriaMod", "selectSottoCategoriaMod", categoria);
    getUbicazione("modSelectUbicazione","modUbicazione");

    document.querySelector('#modaleUpdate').dataset.id = id;
    document.querySelector('#modaleUpdate').dataset.richieste = richieste;
    document.querySelector('#modaleUpdate').dataset.idArticolo = idArticolo;
    document.querySelector('#modaleUpdate').classList.remove('hidden');

    document.querySelector('#btnChiudiUpdate').addEventListener('click', () => {
        document.querySelector('#modaleUpdate').classList.add('hidden');
    });
}

const btnSave = document.getElementById('btnSalvaUpdate');
document.getElementById("modDataModifica").addEventListener("input",checkDate);
async function checkDate(){
    const dataInserimento = document.querySelector('#modData').value;
    const dataModifica = document.querySelector('#modDataModifica').value;
    if(dataModifica < dataInserimento){
        document.getElementById("error").textContent = "La data modifica non può essere inferiore alla data inserimento";
        btnSave.disabled = true;
        btnSave.classList.add('modOpacity');
    }else if(dataModifica > dataOdierna){
        document.getElementById("error").textContent = "La data di modifica non puo essere superiore alla data odierna";
        btnSave.disabled = true;
        btnSave.classList.add('modOpacity');
    }else if(dataModifica < formattedM){
             document.getElementById("error").textContent = "La data di modifica deve essere successiva o uguale alla precedente";
             btnSave.disabled = true;
             btnSave.classList.add('modOpacity');
    }else{
        btnSave.disabled = false;
        btnSave.classList.remove('modOpacity');
        document.getElementById("error").textContent = "";
    }
}

document.querySelector('#btnSalvaUpdate').addEventListener('click', async () =>{
    const id = document.querySelector('#modaleUpdate').dataset.id;
    const richieste = document.querySelector('#modaleUpdate').dataset.richieste;
    const idArticolo = document.querySelector('#modaleUpdate').dataset.idArticolo;
    const quantitaMod = Number(document.querySelector('#modQuantita').value);
    const costoMod = Number(document.querySelector('#modCosto').value);
    const sottoList = [];
    const sottoCat = document.querySelectorAll(".cardLabel");
    sottoCat.forEach(stc =>{
        const sottoCategoria = stc.innerText;
        sottoList.push(sottoCategoria);
    });

    let updatedQuantita = false;
    if(Number(quantita) !== quantitaMod){
        updatedQuantita = true;
    }
    let updatedCosto = false;
    if(Number(costo) !== costoMod){
        updatedCosto = true;
    }

    const articolo = {
        id: id,
        nome: document.querySelector('#modNome').value,
        categoria: document.querySelector('#modCategoria').value,
        sottoCategorie: sottoList,
        ubicazione: document.querySelector('#modUbicazione').value,
        quantita: quantitaMod,
        costo: Number(document.querySelector('#modCosto').value),
        dataInserimento: document.querySelector('#modData').value,
        dataModifica: document.querySelector('#modDataModifica').value,
        richieste: richieste,
        idArticolo: idArticolo,
        costoUnita: costoUnita,
        updatedQuantita: updatedQuantita,
        updatedCosto: updatedCosto
    };
    try{
        const response = await updateArticolo(articolo);
        if(response.status !== 400){
            document.querySelector('#modaleUpdate').classList.add('hidden');
        }else{
            document.getElementById("error").textContent = response.message;
        }
    }catch(err){
        console.error(err);
    }
});

document.getElementById("updateBtnCat").addEventListener('click', updateCategoriaChecked);
const lista = document.querySelector('#listaCat');
const addBtn = document.getElementById('addStcMod');
let cat;
addBtn.addEventListener('click', () => { creaComponentSottoCategoria(lista, ""); });
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
    const modCatNome = document.querySelector('#modNomeCat');

    lista.innerHTML = "";
    document.getElementById("errorAlreadyExists").innerText = "";
    const celle = rigaSelected[0].querySelectorAll('td');
    const nome = celle[0].innerText;
    const stcs = celle[1].innerText.trim();
    cat = nome.trim();
    const oldSottoCategorie = [];
    if(nome.length > 1){
        const sottoCat = stcs.split('\n');
        for(let i = 0; i < sottoCat.length; i++ ){
            const value = sottoCat[i].toLowerCase().trim();
            oldSottoCategorie.push(value);
            creaComponentSottoCategoria(lista, value);
        }
    }

    modCatNome.value = cat;
    document.querySelector('#modaleUpdateCat').classList.remove('hidden');

    document.querySelector('#btnChiudiUpdateCat').addEventListener('click', () => {
        document.querySelector('#modaleUpdateCat').classList.add('hidden');
    });
}

    document.querySelector('#btnSalvaUpdateCat').addEventListener('click', async () =>{
        try{
            const newName = document.querySelector('#modNomeCat').value;
            const newLista = document.querySelector('#listaCat');
            const newComp = newLista.querySelectorAll(".row");
            const newSottoCategorie = [];
            for(let i = 0; i < newComp.length; i++){
                const el = newComp[i].children[0];
                if(el.disabled && !el.value.includes("-deleted")){
                    el.value += "-deleted";
                }
                newSottoCategorie.push(el.value.toLowerCase().trim());
            }
            const response = await updateCategoria(cat, newName, newSottoCategorie);

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

let nomeUb;
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
    nomeUb = celle[0].innerText;

    document.querySelector('#modNomeUb').value = nomeUb;
    document.querySelector('#modaleUpdateUb').classList.remove('hidden');

    document.querySelector('#btnChiudiUpdateUb').addEventListener('click', () => {
        document.querySelector('#modaleUpdateUb').classList.add('hidden');
    });
}

    document.querySelector('#btnSalvaUpdateUb').addEventListener('click', async () =>{
        try{
            const newName = document.querySelector('#modNomeUb').value;
            const response = await updateUbicazione(nomeUb, newName);

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

async function creaGrafico(anno, anno2, direzione){
    const echarts = window.echarts;
    const chart = echarts.init(document.getElementById("chart"));
    const data = await ricercaArticoliGraph(anno);
    let data2;
    anno2 = document.getElementById("compara").value;
    if(isValid(anno2) && anno !== parseInt(anno2)){
        data2 = await ricercaArticoliGraph(anno2);
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
    if(isValid(anno2) && anno !== parseInt(anno2)) data2 = await ricercaMerce(anno2);
    const graph = await createOptionMerce(data, data2);
    chartMerce.setOption(graph);
}

export function isValid(value) {
    return value != null && !Number.isNaN(value) && value !== "" && value != undefined;
}


