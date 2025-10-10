
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
        tr.innerHTML = `
            <td><input type="checkbox" value="${a.id}"></td>
            <td>${a.nome}</td>
            <td>${a.codice}</td>
            <td>${a.categoria}</td>
            <td>${a.quantita}</td>
        `;

        tBody.appendChild(tr);
    });
}