export function creaTabellaArticoli(data){
    const tBody = document.querySelector('#tabellaRicerca tbody');
    tBody.innerHTML = '';

    if(data.length === 0){
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="3">Nessun articolo trovato</td>';
        tBody.appendChild(tr);
        return;
    }

    data.forEach(a => {
        const tr = document.createElement('tr');
        tr.setAttribute('id', a.id);
        tr.setAttribute('richieste', a.richieste);
        const [y, m, d] = a.dataInserimento.split("-");
        const data = `${d}/${m}/${y}`;
        tr.innerHTML = `
            <td>${a.nome}</td>
            <td>${a.categoria}</td>
            <td>${a.ubicazione}</td>
            <td>${a.codice}</td>
            <td>${a.quantita}</td>
            <td>${a.costo}</td>
            <td>${data}</td>
        `;

        tr.addEventListener('click', () => {
            tr.classList.toggle("selected");
            if(a.quantita <= 3){
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

        tBody.appendChild(tr);
    });
}


export async function createOptionMerce(merce){

    const entrata = [0,0,0,0,0,0,0,0,0,0,0,0];
    const uscita = [0,0,0,0,0,0,0,0,0,0,0,0];

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

    const option = {
      title: {
        text: 'Movimenti'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Entrata', 'Uscita']
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
        }
      ]
    };

    return option;
}

export async function createOptionCosto(articoli){

    const valore = [0,0,0,0,0,0,0,0,0,0,0,0];

    articoli.forEach( item => {
    const data = item.dataInserimento.split('-');
    const mese = data[1];
    let index;
    if(mese[0] === '0'){
        index = parseInt(mese[1], 10) - 1;
    }else{
        index = parseInt(mese) - 1;
    }
    valore[index] += item.costo;
    });

    const option = {
      title: {
        text: 'Valore Magazzino'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Entrata', 'Uscita']
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
        }
      ]
    };

    return option;
}

