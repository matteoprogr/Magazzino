
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
        tr.innerHTML = `
            <td>${a.nome}</td>
            <td>${a.codice}</td>
            <td>${a.categoria}</td>
            <td>${a.quantita}</td>
        `;

        tr.addEventListener('click', () => {
            tr.classList.toggle("selected");
        });

        tBody.appendChild(tr);
    });
}
