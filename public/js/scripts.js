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



let loginForm = document.querySelector("#loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", validateLogin);
}
let registerForm = document.querySelector("#registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", validateRegister);
}

// Handle favorite checkboxes
const favoriteCheckboxes = document.querySelectorAll('.favorite-checkbox');
favoriteCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', async function() {
        const recipeId = this.dataset.recipeId;
        const source = this.dataset.recipeSource;
        
        let body = { recipe_id: recipeId, source: source };
        
        // For web recipes, we also call for nutrition data
        if (source === 'web') {
            body.recipe_data = {
                title: this.dataset.recipeTitle,
                cuisine: this.dataset.recipeCuisine,
                meal_type: this.dataset.recipeMealType,
                diet: this.dataset.recipeDiet,
                price: this.dataset.recipePrice,
                cook_time: this.dataset.recipeCookTime,
                img_url: this.dataset.recipeImgUrl,
                fat: this.dataset.recipeFat || 0,
                carb: this.dataset.recipeCarb || 0,
                protein: this.dataset.recipeProtein || 0
            };
        }
        
        try {
            const response = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            
            if (data.success) {
                const label = this.parentElement;
                if (data.action === 'added') {
                    label.style.color = '#4CAF50';
                } else {
                    label.style.color = '';
                }
            } else {
                this.checked = !this.checked;
                alert('Error updating favorites.');
            }
        } catch (error) {
            console.error('Error:', error);
            this.checked = !this.checked;
            alert('Error updating favorites.');
        }
    });
});


// loadFoodish();
const foodImg = document.querySelector("#foodishImg");
if (foodImg) loadFoodish();

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
