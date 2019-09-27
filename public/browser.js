// Creat an item
const form = document.getElementById("create-form");
const input = document.getElementById("create-field");
const list = document.getElementById("item-list");

const itemTemplate = item => `<li class="list-group-item">
    <span class="item-text">${item.text}</span>
    <div class="button-wrap">
      <button data-id="${item._id}"class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${item._id}"class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`;

const ourHTML = items.map(item => itemTemplate(item)).join("");

list.insertAdjacentHTML("beforeend", ourHTML);

form.addEventListener("submit", e => {
  e.preventDefault();
  if (input.value.length <= 2) {
    return alert("Must be longer than 2 letters");
  }
  axios
    .post("/create-item", { text: input.value })
    .then(response => {
      // Create HTML for new item here
      list.insertAdjacentHTML("beforeend", itemTemplate(response.data));
    })
    .catch(error => {
      console.log(error);
    });
  input.value = "";
  input.focus();
});

// Delete the item from browser and database
document.addEventListener("click", e => {
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Are you sure you want to delete this item?")) {
      axios
        .post("/delete-item", { id: e.target.getAttribute("data-id") })
        .then(() => {
          e.target.parentElement.parentElement.remove();
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
  // Update when edit is clicked
  if (e.target.classList.contains("edit-me")) {
    let userInput = prompt(
      "Enter your new text",
      e.target.parentElement.parentElement.querySelector(".item-text").innerHTML
    );
    if (userInput) {
      axios
        .post("/update-item", {
          text: userInput,
          id: e.target.getAttribute("data-id")
        })
        .then(() => {
          e.target.parentElement.parentElement.querySelector(
            ".item-text"
          ).innerHTML = userInput;
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
});

// When the form is submitted
// Get the value
// Add the value to the list
// Make the server get this value and POST to the database
