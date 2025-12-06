-- =====================================================
-- SMARTBITE DATABASE SCHEMA
-- =====================================================

-- USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    diet_goal VARCHAR(50),       -- e.g., lose_weight, gain_muscle
    budget_level VARCHAR(50),    -- low, regular, fancy
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- RECIPES TABLE
CREATE TABLE recipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,            -- NULL = default recipe, not user-submitted
    title VARCHAR(255) NOT NULL,
    cuisine VARCHAR(100),        -- Asian, Mexican, Italian, etc.
    meal_type VARCHAR(50),       -- lunch, dinner, weekend, etc.
    budget_level VARCHAR(50),    -- low, regular, fancy
    health_goal VARCHAR(100),    -- lose_weight, low_carb, high_protein, etc.
    cook_time_minutes INT,
    image_url VARCHAR(300),
    instructions TEXT,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
);

-- INGREDIENTS TABLE
CREATE TABLE ingredients (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    default_unit VARCHAR(50),         -- g, ml, cup, tbsp, etc.
    calories_per_unit DECIMAL(10,2),  -- optional, filled from nutrition API
    notes VARCHAR(255)
);

-- RECIPE_INGREDIENTS TABLE (many-to-many)
CREATE TABLE recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),

    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
        ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id)
        ON DELETE CASCADE
);

-- FAVORITES TABLE (user saves recipes)
CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
        ON DELETE CASCADE
);

-- GROCERY LISTS TABLE
CREATE TABLE grocery_lists (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- GROCERY ITEMS TABLE (items inside each list)
CREATE TABLE grocery_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,
    ingredient_name VARCHAR(150) NOT NULL,  -- user-typed or pulled from recipe
    quantity VARCHAR(50),
    checked TINYINT(1) DEFAULT 0,          -- for checkbox toggle

    FOREIGN KEY (list_id) REFERENCES grocery_lists(list_id)
        ON DELETE CASCADE
);