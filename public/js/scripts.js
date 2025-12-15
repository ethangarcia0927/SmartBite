//Event listener(s)
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