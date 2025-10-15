
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