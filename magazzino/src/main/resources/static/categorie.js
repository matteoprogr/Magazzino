import { setDataCosto } from './gestioneMagazzino.js'

export function creaTabellaCategoria(data){
    const tBody = document.querySelector('#tabellaCategorie tbody');
    tBody.innerHTML = '';

    if(data.length === 0){
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="1">Nessuna categoria presente</td>`;
        tBody.appendChild(tr);
        return;
    }


    data.forEach( cat => {
        const stc = cat.sottoCategorie !== null ? cat.sottoCategorie : "";
        let toStringStc = "";
        if(stc !== "" && stc !== null && stc.length > 0){
            toStringStc = ""
            for(let i = 0; i < stc.length; i++){
                if(i == 0){
                    toStringStc += " " + stc[i];
                }else{
                    toStringStc += "<br>" + stc[i];
                }
            }
        }
        const tr = document.createElement('tr');
        tr.setAttribute('id', cat.id);
        tr.innerHTML = `
            <td>${cat.nome}</td>
            <td>${toStringStc}</td>
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
        tr.innerHTML = `<td colspan="1">Nessuna ubicazione presente</td>`;
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

export async function creaComponentSottoCategoria(container, value){

    const div = document.createElement('div');
    div.classList.add("row");

    const stcModInput = document.createElement('input');
    stcModInput.type = 'text';
    stcModInput.maxLength = 30;
    stcModInput.placeholder = 'Sotto categoria';
    stcModInput.value = value.toLowerCase().trim();
    div.appendChild(stcModInput);

    const stcModBtn = document.createElement('button');
    stcModBtn.type = "button";
    stcModBtn.innerText = "x";
    stcModBtn.classList.add("stcBtn");
    div.appendChild(stcModBtn);

    stcModBtn.addEventListener('click', () =>{
        const bool = stcModInput.disabled === true ? false : true;
        stcModInput.disabled = bool;
        if(bool){
            stcModInput.classList.add("modOpacity");
        }else{
            stcModInput.classList.remove("modOpacity");
        }

    });

    container.appendChild(div);
}