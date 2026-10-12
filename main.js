const submitButton = document.getElementById('submitButton');
const inputField = document.getElementById('inputField');
const outputDiv = document.getElementById('output');
const ticketFilter = document.getElementById('ticketFilter');
let ticketList = JSON.parse(localStorage.getItem('tickets')) || [];


ticketFilter.addEventListener('change', function () {
    renderTickets();
});


function saveTickets() {
    localStorage.setItem('tickets', JSON.stringify(ticketList));
}


function renderTickets() {
    outputDiv.textContent = ''; // Clear previous output
    const listHere = ticketList.filter(ticket => {
        if (ticketFilter.value === 'all') return true;
        return ticket.status === ticketFilter.value;
    });
    listHere.forEach(ticket => {
        const li = document.createElement('li');
        if (ticket.status === "closed") {
            li.textContent = ticket.title + " - Closed";
            li.style.textDecoration = "line-through";
        } else {
            li.textContent = ticket.title;
            const closeBtn = document.createElement("button");
            closeBtn.textContent = "close";
            li.appendChild(closeBtn);
            closeBtn.addEventListener('click', function () {
                ticket.status = "closed";
                saveTickets();
                renderTickets();
            })
        }
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "delete";
        li.appendChild(deleteBtn);
        deleteBtn.addEventListener('click', function () {
            ticketList = ticketList.filter(t => t.id !== ticket.id);
            saveTickets();
            renderTickets();
        })
        const editBtn = document.createElement("button");
        editBtn.textContent = "edit";
        li.appendChild(editBtn);
        editBtn.addEventListener('click', function () {
            const newTitle = prompt('Edit ticket title:', ticket.title);
            if (newTitle !== null && newTitle.trim() !== '') {
                ticket.title = newTitle.trim();
                saveTickets();
                renderTickets();
            }
        })
        outputDiv.appendChild(li);
    })
};


submitButton.addEventListener('click', function () {
    const title = inputField.value.trim();
    if (title === '') {
        alert('Please enter a ticket before submitting.');
        return;
    }
    else if (ticketList.some(ticket => ticket.title.toLowerCase() === title.toLowerCase())) {
        alert('This ticket has already been submitted.');
        return;
    }
    else {
        ticketList.push({ id: Date.now(), title: title, status: 'open' });
        inputField.value = '';
    }
    saveTickets();
    renderTickets();
});



renderTickets(); // Initial render on page load
