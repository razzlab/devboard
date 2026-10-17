const submitButton = document.getElementById("submitButton");
const inputField = document.getElementById("inputField");
const outputDiv = document.getElementById("output");
const ticketFilter = document.getElementById("ticketFilter");
const searchInput = document.getElementById("searchInput");
let ticketList = JSON.parse(localStorage.getItem("tickets")) || [];

ticketFilter.addEventListener("change", function () {
  renderTickets();
});

function saveTickets() {
  localStorage.setItem("tickets", JSON.stringify(ticketList));
}

function renderTickets() {
  outputDiv.textContent = ""; // Clear previous output
  const searchValue = searchInput.value.trim().toLowerCase();
  const listHere = ticketList.filter((ticket) => {
    // 1. Normalize your search input to lowercase for case-insensitive matching
    const searchLower = searchValue.toLowerCase().trim();

    // 2. Determine if the ticket matches the text search (if search is empty, default to true)
    const matchesSearch =
      searchLower === "" || ticket.title.toLowerCase().includes(searchLower);

    // 3. Determine if the ticket matches the dropdown/status filter
    const matchesFilter =
      ticketFilter.value === "all" || ticket.status === ticketFilter.value;

    // 4. Return true only if it satisfies both criteria
    return matchesSearch && matchesFilter;
  });

  listHere.forEach((ticket) => {
    const li = document.createElement("li");
    if (ticket.status === "closed") {
      li.textContent = ticket.title + " - Closed";
      li.style.textDecoration = "line-through";
    } else {
      li.textContent = ticket.title;
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "close";
      li.appendChild(closeBtn);
      closeBtn.addEventListener("click", function () {
        ticket.status = "closed";
        saveTickets();
        renderTickets();
      });
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "delete";
    li.appendChild(deleteBtn);
    deleteBtn.addEventListener("click", function () {
      ticketList = ticketList.filter((t) => t.id !== ticket.id);
      saveTickets();
      renderTickets();
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "edit";
    li.appendChild(editBtn);

    editBtn.addEventListener("click", function () {
      const newTitle = prompt("Edit ticket title:", ticket.title);
      if (newTitle !== null && newTitle.trim() !== "") {
        if (newTitle.trim().toLowerCase() === ticket.title.toLowerCase()) {
          alert("The new title is the same as the current title.");
          return;
        } else if (
          ticketList.some(
            (t) =>
              t.title.toLowerCase() === newTitle.trim().toLowerCase() &&
              t.id !== ticket.id,
          )
        ) {
          alert("This ticket title already exists.");
          return;
        } else {
          ticket.title = newTitle.trim();
          saveTickets();
          renderTickets();
        }
      }
    });

    outputDiv.appendChild(li);
  });
}

submitButton.addEventListener("click", function () {
  const title = inputField.value.trim();
  if (title === "") {
    alert("Please enter a ticket before submitting.");
    return;
  } else if (
    ticketList.some(
      (ticket) => ticket.title.toLowerCase() === title.toLowerCase(),
    )
  ) {
    alert("This ticket has already been submitted.");
    return;
  } else {
    ticketList.push({ id: Date.now(), title: title, status: "open" });
    inputField.value = "";
  }
  saveTickets();
  renderTickets();
});

searchInput.addEventListener("keyup", function () {
  renderTickets();
});

renderTickets(); // Initial render on page load
