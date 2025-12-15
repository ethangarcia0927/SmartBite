//Event listener(s)
document.querySelector("#loginForm").addEventListener("submit", validateLogin);

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