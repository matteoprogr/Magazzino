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


export async function createOption(articoli){
    const aggregato = {};

      articoli.forEach(item => {
        const categoria = item.categoria;
        const quantita = Number(item.quantita) || 0;
        if (!aggregato[categoria]) {
          aggregato[categoria] = 0;
        }
        aggregato[categoria] += Math.abs(quantita);
      });

      const data = Object.entries(aggregato).map(([name, value]) => ({ name, value }));
      let totale = data.reduce((acc, item) => acc + item.value, 0);

        const option = {
          tooltip: {
            trigger: 'item',
            formatter: function (params) {
                  return `${params.name}<br>
                          Quantità: ${Number(params.value).toFixed(2)} <br>
                          % sul totale: ${(Number(params.value)/ totale * 100).toFixed(2)} `;
                }
          },
          legend: {
            type: 'scroll',
            orient: 'vertical',
            top: '10%',
            left: 'left',
            height: '80%',
            pageFormatter: '',
            pageIconSize: 16,
            pageIconColor: '#555',
            pageIconInactiveColor: '#ddd',
            pageTextStyle: { color: 'transparent' }
          },
          series: [
            {
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['65%', '45%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                position: 'center',
                formatter: () => `${totale.toFixed(2)}`,
                fontSize: 18,
                fontWeight: 'bold',
                lineHeight: 22
              },
              labelLine: {
                show: false
              },
              data: data
            }
          ]
        };

        return option;
}

export function attachLegendHandler(chart) {
    chart.on('legendselectchanged', function (params) {
        const option = chart.getOption();
        const selected = params.selected;
        const data = option.series[0].data;
        const newTotal = data.reduce((acc, item) => { return selected[item.name] ? acc + item.value : acc; }, 0);

        chart.setOption({
        series: [{
          label: {
           formatter: () => `${newTotal.toFixed(2)}`
          }
         }]
        });

        chart.setOption ({
         tooltip: {
          ...option.tooltip[0],
          formatter: function(p){
           return `${p.name}: ${Number(p.value).toFixed(2)} <br>
                   % sul totale: ${(p.value /newTotal * 100).toFixed(2)}`;
          }
         }
        }, false, true);
    });
}

export async function createOptionMerce(articoli){


    option = {
      title: {
        text: 'Stacked Line'
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
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: 'Uscita',
          type: 'line',
          data: [220, 182, 191, 234, 290, 330, 310]
        }
      ]
    };

}
