import { setDataCosto } from './gestioneMagazzino.js'

export function creaTabellaCategoria(data){
    const tBody = document.querySelector('#tabellaCategorie tbody');
    tBody.innerHTML = '';

    if(data.length === 0){
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2">Nessuna categoria presente</td>`;
        tBody.appendChild(tr);
        return;
    }

    data.forEach( cat => {
        const tr = document.createElement('tr');
        tr.setAttribute('id', cat.id);
        tr.innerHTML = `
            <td>${cat.nome}</td>
        `;

       tr.addEventListener('click', () => {
            tr.classList.toggle("selected");
        });

        tBody.appendChild(tr);
    });
}

export function creaTabellaUbicazione(data){
    const tBody = document.querySelector('#tabellaUbicazioni tbody');
    tBody.innerHTML = '';

    if(data.length === 0){
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2">Nessuna ubicazione presente</td>`;
        tBody.appendChild(tr);
        return;
    }

    data.forEach(ub => {
        const tr = document.createElement('tr');
        tr.setAttribute('id', ub.id);
        tr.innerHTML = `
            <td>${ub.nome}</td>
        `;

       tr.addEventListener('click', () => {
            tr.classList.toggle("selected");
        });

        tBody.appendChild(tr);
    });
}

function parseMese(mese){
    let index;
    if(mese[0] === '0'){
        index = parseInt(mese[1], 10) - 1;
    }else{
        index = parseInt(mese) - 1;
    }
    return index;
}

const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
               'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

function convertiMese(mese){
    const meseIndex = parseMese(mese);
    return mesi[meseIndex];
}

export function creaTabellaMerce(data){

    data.sort((a, b) => parseMese(a.mese - b.mese));
    data.forEach(me =>{
        me.mese = convertiMese(me.mese);
    });

    const tBody = document.querySelector('#tabellaMerce tbody');
    tBody.innerHTML = '';

    if(data.length === 0){
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2">Nessuna merce presente</td>`;
        tBody.appendChild(tr);
        return;
    }

    data.forEach(me => {
        const tr = document.createElement('tr');
        tr.setAttribute('anno', me.anno);
        tr.innerHTML = `
            <td>${me.mese}</td>
            <td>${me.entrata} <br> (${me.valoreEntrate.toFixed(1)})</td>
            <td>${me.uscita} <br> (${me.valoreUscite.toFixed(1)})</td>
        `;

        tBody.appendChild(tr);
    });
}



export function creaTabellaValore(data){

    const valore = [];
    const valoreMese = [];
    setDataCosto(data, valore);
    for(let i = 0; i < valore.length; i++){
        const mese = {};
        if(valore[i] !== undefined){
            mese.mese = convertiMese(i + 1);
            mese.valore = valore[i];
        }
        if(mese.valore !== undefined) valoreMese.push(mese);
    }

    const tBody = document.querySelector('#tabellaValore tbody');
    tBody.innerHTML = '';

    if(data.length === 0){
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2">Nessun valore presente</td>`;
        tBody.appendChild(tr);
        return;
    }

    valoreMese.forEach(val => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${val.mese}</td>
            <td>${val.valore}</td>
        `;

        tBody.appendChild(tr);
    });
}