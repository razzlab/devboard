const submitButton = document.getElementById("submitButton");
const inputField = document.getElementById("inputField");
const outputDiv = document.getElementById("output");
const ticketFilter = document.getElementById("ticketFilter");
const searchInput = document.getElementById("searchInput");
const totalTicketsDiv = document.getElementById("totalTickets");
const openTicketsDiv = document.getElementById("openTickets");
const closedTicketsDiv = document.getElementById("closedTickets");
const sortOrder = document.getElementById("sortOrder");
let lastDeletedTickets = []; // Variable to store the last deleted ticket for undo functionality
const undoButton = document.getElementById("undoButton");

const ticketListOnStorage = () => {
  try {
    const data = localStorage.getItem("tickets");
    if (!data) return [];

    const parsed = JSON.parse(data);

    // Ensure it is an array, then filter for the exact object structure
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (ticket) =>
        ticket &&
        typeof ticket.id === "number" &&
        Number.isFinite(ticket.id) &&
        typeof ticket.title === "string" &&
        (ticket.status === "open" || ticket.status === "closed"),
    );
  } catch (e) {
    console.error("Error parsing tickets from localStorage:", e);
    return [];
  }
};

let ticketList = ticketListOnStorage(); // Get the current state of ticketList

ticketFilter.addEventListener("change", function () {
  renderTickets();
});

function saveTickets() {
  localStorage.setItem("tickets", JSON.stringify(ticketList));
}

function renderTickets() {
  undoButton.disabled = !lastDeletedTickets.length;
  const totalTickets = ticketList.length;
  const openTickets = ticketList.filter(
    (ticket) => ticket.status === "open",
  ).length;
  const closedTickets = ticketList.filter(
    (ticket) => ticket.status === "closed",
  ).length;
  totalTicketsDiv.textContent = `Total Tickets: ${totalTickets}`;
  openTicketsDiv.textContent = `Open Tickets: ${openTickets}`;
  closedTicketsDiv.textContent = `Closed Tickets: ${closedTickets}`;
  outputDiv.textContent = ""; // Clear previous output
  const searchValue = searchInput.value.trim().toLowerCase();

  const listHere = ticketList.filter((ticket) => {
    // 1. Determine if the ticket matches the text search (if search is empty, default to true)
    const matchesSearch =
      searchValue === "" || ticket.title.toLowerCase().includes(searchValue);

    // 2. Determine if the ticket matches the dropdown/status filter
    const matchesFilter =
      ticketFilter.value === "all" || ticket.status === ticketFilter.value;

    // 3. Return true only if it satisfies both criteria
    return matchesSearch && matchesFilter;
  });

  if (sortOrder.value === "asc") {
    listHere.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder.value === "desc") {
    listHere.sort((a, b) => b.title.localeCompare(a.title));
  }
  listHere.forEach((ticket) => {
    const li = document.createElement("li");
    if (ticket.status === "closed") {
      li.textContent = ticket.title + " - Closed";
      li.style.textDecoration = "line-through";

      const reopenBtn = document.createElement("button");
      reopenBtn.textContent = "reopen";
      li.appendChild(reopenBtn);
      reopenBtn.addEventListener("click", function () {
        ticket.status = "open";
        saveTickets();
        renderTickets();
      });
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
      lastDeletedTickets.push(ticketList.find((t) => t.id === ticket.id)); // Store the deleted ticket for undo
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

sortOrder.addEventListener("change", function () {
  renderTickets();
});

undoButton.addEventListener("click", function () {
  undoButton.disabled = true; // Disable the undo button after undoing
  ticketList.push(lastDeletedTickets[lastDeletedTickets.length - 1]); // Restore the last deleted ticket
  lastDeletedTickets.pop(); // Remove the last deleted ticket from the array
  saveTickets();
  renderTickets();
});

renderTickets(); // Initial render on page load
