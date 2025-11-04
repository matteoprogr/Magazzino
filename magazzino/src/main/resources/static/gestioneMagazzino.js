export function creaTabellaArticoli(data){
    const tBody = document.querySelector('#tabellaRicerca tbody');
    tBody.innerHTML = '';

    if(data.length === 1){
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="3">Nessun articolo trovato</td>';
        tBody.appendChild(tr);
        return;
    }

    data.forEach(a => {
        const tr = document.createElement('tr');
        let toStringStc = "";
        let dataModifica = "";
        let dataIns = "";
        if(a.codice !== "Totale:"){
            tr.setAttribute('id', a.id);
            tr.setAttribute('richieste', a.richieste);
            tr.setAttribute('idArticolo', a.idArticolo);
            const [y, m, d] = a.dataInserimento.split("-");
            dataIns = `${d}/${m}/${y}`;
            const [yM, mM, dM] = a.dataModifica.split("-");
            dataModifica = `${dM}/${mM}/${yM}`;
            const stc = a.sottoCategorie !== null ? a.sottoCategorie : "";

            if(stc !== "" && stc !== null && stc.length > 0){
            toStringStc = "["
            for(let i = 0; i < stc.length; i++){
                if(i == 0){
                    toStringStc += " " + stc[i];
                }else{
                    toStringStc += '<br>' + stc[i];
                }
            }
            toStringStc += " ]";
            }

            tr.innerHTML = `
                <td>${a.nome}</td>
                <td>${a.categoria} <br> ${toStringStc}</td>
                <td>${a.ubicazione}</td>
                <td>${a.codice}</td>
                <td>${a.quantita}</td>
                <td>${a.costo}</td>
                <td>${a.costoUnita.toFixed(2)}</td>
                <td>${a.valore.toFixed(2)}</td>
                <td>${dataIns}</td>
                <td>${dataModifica}</td>
            `;

            tr.addEventListener('click', () => {
                tr.classList.toggle("selected");
                if(a.quantita <= 2){
                    tr.classList.toggle("redTr");
                }
                if(a.quantita <= 5 && a.quantita > 2){
                    tr.classList.toggle("yellowTr");
                }
            });
            if(a.quantita <= 2){
                tr.classList.add("redTr");
            }
            if(a.quantita <= 5 && a.quantita > 2){
                tr.classList.add("yellowTr");
            }
        }else{

            const stc = a.sottoCategorie !== null ? a.sottoCategorie : "";

            if(stc !== "" && stc !== null && stc.length > 0){
            toStringStc = "["
            for(let i = 0; i < stc.length; i++){
                if(i == 0){
                    toStringStc += " " + stc[i];
                }else{
                    toStringStc += '<br>' + stc[i];
                }
            }
            toStringStc += " ]";
            }
            tr.innerHTML = `

                <td>${a.nome}</td>
                <td>${a.categoria} <br> ${toStringStc}</td>
                <td>${a.ubicazione}</td>
                <td>${a.codice}</td>
                <td>${a.quantita}</td>
                <td>${a.costo.toFixed(2)}</td>
                <td></td>
                <td>${a.valore.toFixed(2)}</td>
                <td></td>
                <td></td>
            `;

            tr.classList.add("purpleTr");
        }

        tBody.appendChild(tr);
    });
}


function setData(merce, entrata, uscita){
    merce.forEach( item => {
    const mese = item.mese;
    let index;
    if(mese[0] === '0'){
        index = parseInt(mese[1]) - 1;
    }else{
        index = parseInt(mese) - 1;
    }
    entrata[index] = item.entrata;
    uscita[index] = item.uscita;
    });
    let primoIndice = entrata.findIndex(x => x !== undefined);
    const ultimoIndice = entrata.findLastIndex(x => x !== undefined);
    for(let i = primoIndice + 1; i < ultimoIndice; i++){
        if(entrata[i] === undefined){
            entrata[i] = 0;
            uscita[i] = 0;
        }
    }
}


export async function createOptionMerce(merce, merce2){

    const entrata = [];
    const uscita = [];
    const entrata2 = [];
    const uscita2 = [];
    const leg = ['Entrata', 'Uscita'];
    if(merce2 !== undefined && merce2 !== null && merce2.length > 0){
        leg[2] = "Entrata2";
        leg[3] = "Uscita2";
        setData(merce2, entrata2, uscita2);
    }

    setData(merce, entrata, uscita);

    const option = {
      title: {
        text: 'Movimenti'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: leg
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
               'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Entrata',
          type: 'line',
          data: entrata
        },
        {
          name: 'Uscita',
          type: 'line',
          data: uscita
        },
        {
          name: 'Entrata2',
          type: 'line',
          data: entrata2
        },
        {
          name: 'Uscita2',
          type: 'line',
          data: uscita2
        }
      ]
    };

    return option;
}


export function setDataCosto(articoli, valore){
    if(articoli !== undefined && articoli.length > 0){
        articoli.forEach( item => {
        const data = item.dataModifica.split('-');
        const mese = data[1];
        let index;
        if(mese[0] === '0'){
            index = parseInt(mese[1], 10) - 1;
        }else{
            index = parseInt(mese) - 1;
        }
        const val = valore[index] !== undefined ? valore[index]: 0;
        const qcu = item.valore;
        const totvalue = qcu + val;
        valore[index] = Number(totvalue.toFixed(2));
        });
    }

}

export async function createOptionCosto(articoli, articoli2){

    const valore = [];
    const valore2 = [];
    const leg = ["Valore"];

    setDataCosto(articoli, valore);
    if(articoli2 !== undefined && articoli2 !== null && articoli2.length > 0){
        setDataCosto(articoli2, valore2);
        leg[1] = "Valore2";
    }

    const option = {
      title: {
        text: 'Valore Magazzino'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: leg
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
               'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Valore',
          type: 'line',
          data: valore
        },
        {
          name: 'Valore2',
          type: 'line',
          data: valore2
        }
      ]
    };

    return option;
}

