//Event listener(s)

//for newRecipe page
const budgetSelect = document.querySelector("#budget_level");
const healthSelect = document.querySelector("#health_goal");

if (budgetSelect) {
    loadBudgetLevels();
}
if (healthSelect) {
    loadHealthGoals();
}
let loginForm = document.querySelector("#loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", validateLogin);
}
let registerForm = document.querySelector("#registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", validateRegister);
}


loadFoodish();

async function loadFoodish() {
    let url = "https://foodish-api.com/api/";
    let response = await fetch(url);
    let data = await response.json();
    let foodImg = document.querySelector("#foodishImg");
    // foodImg.innerHtml = "<img src="data.image">";
    foodImg.src = data.image;
    foodImg.alt = "Random foodish API food image";

}

function validateLogin(e) {
    let isValid = true;
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;

    if (email.length === 0) {
        alert("Email required!");
        isValid = false;
    }
     if (password.length === 0) {
        alert("Password required!");
        isValid = false;
    }
    if (!isValid) {
        e.preventDefault();
    }
}


function validateRegister(e) {
    let isValid = true;
    let name = document.querySelector("#name").value;
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#pwd").value;

    if (email.length === 0) {
        alert("Email required!");
        isValid = false;
    }

    if (name.length === 0) {
        alert("Name required!");
        isValid = false;
    }

    if (password.length === 0) {
        alert("Password required!");
        isValid = false;
    }
     if (password.length < 6) {
        alert("Password should be at least 6 characters!");
        isValid = false;
    }
    if (!isValid) {
        e.preventDefault();
    }
}

//fetch budget levels from local API
async function loadBudgetLevels() {

    let response = await fetch("/api/budgetLevels");
    let data = await response.json();

    let select = document.querySelector("#budget_level");
    //clear loading text
    select.innerHTML = "";

    //add default option
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Budget Level";
    select.appendChild(defaultOption);

    data.forEach(item => {
        let option = document.createElement("option");
        option.value = item.budget_level;
        option.textContent = item.budget_level;
        select.appendChild(option);
    });


}

//fetch health goals from local API
async function loadHealthGoals() {

    let response = await fetch("/api/healthGoals");
    let data = await response.json();

    let select = document.querySelector("#health_goal");
    select.innerHTML = "";

    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Health Goal";
    select.appendChild(defaultOption);

    data.forEach(item => {
        let option = document.createElement("option");
        option.value = item.health_goal;
        option.textContent = item.health_goal;
        select.appendChild(option);
    });

    }