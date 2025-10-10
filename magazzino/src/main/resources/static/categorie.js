
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
        tr.innerHTML = `
            <td><input type="checkbox" value="${a.id}"></td>
            <td>${cat}</td>
        `;

        tBody.appendChild(tr);
    });

}