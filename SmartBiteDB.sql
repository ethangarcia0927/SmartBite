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

-- Test User values, may need to run this on your local MySQL workbench to use:
INSERT INTO users (name, email, password_hash, diet_goal, budget_level)
VALUES ('Test User','test@user.com',
'$2a$10$06ofFgXJ9wysAOzQh0D0..RcDp1w/urY3qhO6VuUJL2c6tzAJPfj6',
'lose_weight','low');

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



-- SQL to create the tables

-- Drop tables if they already exist (child table first)
DROP TABLE IF EXISTS `fp_favorites`;
DROP TABLE IF EXISTS `fp_recipes`;




-- Recipes table
CREATE TABLE `fp_recipes` (
  `recipe_id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) COLLATE utf8_unicode_ci NOT NULL,
  `budget_level` VARCHAR(20) COLLATE utf8_unicode_ci NOT NULL,      -- e.g. 'Low Cost', 'Regular', 'Treat'
  `cook_time` SMALLINT(4) NOT NULL,                                  -- minutes
  `health_goal` VARCHAR(30) COLLATE utf8_unicode_ci NOT NULL,        -- e.g. 'Low Carb', 'Low Fat', 'High Protein', 'None'
  `img_url` VARCHAR(255) COLLATE utf8_unicode_ci NOT NULL,
  `fat` SMALLINT(4) NOT NULL,                                        -- grams per serving
  `carb` SMALLINT(4) NOT NULL,                                       -- grams per serving
  `protein` SMALLINT(4) NOT NULL,                                    -- grams per serving
  `ingredients` VARCHAR(500) COLLATE utf8_unicode_ci NOT NULL,
  `instructions` VARCHAR(1000) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`recipe_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;




INSERT INTO `fp_recipes`
(`recipe_id`, `title`, `budget_level`, `cook_time`, `health_goal`, `img_url`,
 `fat`, `carb`, `protein`, `ingredients`, `instructions`)
VALUES
(1, 'Chicken Salad', 'Low Cost', 25, 'Low Carb', 'img/chicken_salad.jpg',
  9, 2, 24,
 'Cooked chicken, greek yogurt, celery, red onion, lemon juice, salt, pepper.',
 'Combine chicken with yogurt and chopped vegetables, season with lemon, salt and pepper, chill and serve.'),

(2, 'Veggie Stir Fry', 'Low Cost', 20, 'Low Fat', 'img/veggie_stir_fry.jpg',
  8, 35, 10,
 'Broccoli, bell pepper, carrot, snap peas, soy sauce, garlic, ginger, oil.',
 'Stir fry vegetables in a hot pan with a small amount of oil, add garlic, ginger and soy sauce, cook until crisp tender.'),

(3, 'Beef Burrito Bowl', 'Regular', 30, 'High Protein', 'img/beef_burrito_bowl.jpg',
 15, 45, 28,
 'Ground beef, rice, black beans, corn, lettuce, tomato, salsa.',
 'Brown beef, cook rice, warm beans and corn, layer all ingredients in a bowl and top with salsa.'),

(4, 'Tofu Buddha Bowl', 'Low Cost', 25, 'High Protein', 'img/tofu_buddha_bowl.jpg',
 14, 40, 22,
 'Tofu, quinoa, spinach, roasted sweet potato, chickpeas, tahini sauce.',
 'Bake tofu and sweet potato, cook quinoa, arrange with spinach and chickpeas in a bowl, drizzle with tahini sauce.'),

(5, 'Pesto Pasta', 'Regular', 20, 'None', 'img/pesto_pasta.jpg',
 18, 55, 15,
 'Pasta, basil pesto, cherry tomatoes, parmesan cheese.',
 'Cook pasta until al dente, toss with pesto and cherry tomatoes, sprinkle with parmesan and serve.'),

(6, 'Overnight Oats', 'Low Cost', 5, 'Low Fat', 'img/overnight_oats.jpg',
 6, 40, 10,
 'Rolled oats, milk, chia seeds, berries, honey.',
 'Mix oats, milk and chia in a jar, chill overnight, top with berries and honey before serving.'),

(7, 'Greek Yogurt Parfait', 'Low Cost', 10, 'High Protein', 'img/yogurt_parfait.jpg',
 5, 25, 18,
 'Greek yogurt, granola, mixed berries, honey.',
 'Layer yogurt, berries and granola in a glass, drizzle with honey and serve chilled.'),

(8, 'Salmon Rice Bowl', 'Treat', 30, 'High Protein', 'img/salmon_rice_bowl.jpg',
 18, 40, 32,
 'Salmon fillet, rice, cucumber, avocado, soy sauce, sesame seeds.',
 'Bake or pan sear salmon, cook rice, serve with sliced cucumber and avocado on top and season with soy sauce and sesame.'),

(9, 'Lentil Soup', 'Low Cost', 35, 'Low Fat', 'img/lentil_soup.jpg',
 7, 40, 18,
 'Lentils, carrot, celery, onion, tomato, vegetable broth.',
 'Saute onion, carrot and celery, add lentils, tomato and broth, simmer until lentils are tender and season to taste.'),

(10, 'Shrimp Fried Rice', 'Regular', 25, 'None', 'img/shrimp_fried_rice.jpg',
 14, 45, 22,
 'Cooked rice, shrimp, egg, peas, carrot, soy sauce, green onion.',
 'Scramble egg, stir fry shrimp and vegetables, add rice and soy sauce, cook until heated through and garnish with green onion.'),

(11, 'Avocado Toast With Egg', 'Low Cost', 15, 'Low Carb', 'img/avocado_toast_egg.jpg',
 16, 20, 14,
 'Whole grain bread, avocado, egg, salt, pepper, lemon.',
 'Toast bread, mash avocado with lemon, fry or poach egg, spread avocado on toast, top with egg and season with salt and pepper.'),

(12, 'Turkey Chili', 'Low Cost', 40, 'High Protein', 'img/turkey_chili.jpg',
 10, 35, 28,
 'Ground turkey, kidney beans, tomato, onion, chili powder, cumin.',
 'Brown turkey with onion, add beans, tomato and spices, simmer until thick and adjust seasoning before serving.');
