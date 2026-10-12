import type { Recipe } from '../types';

export const PRE_BUILT_RECIPES: { [key: string]: Recipe } = {
  'speedy-salmon': {
    recipeName: "Speedy Salmon & Asparagus",
    description: "A quick, healthy, and delicious one-pan meal perfect for a busy weeknight. Ready in under 15 minutes!",
    isHealthy: true,
    cuisine: "American",
    prepTime: "15 mins",
    difficulty: "beginner",
    visualPrompt: "A succulent grilled salmon fillet with crispy skin, served alongside vibrant green roasted asparagus spears and thin lemon slices on a rustic baking sheet.",
    ingredients: [
      "2 salmon fillets",
      "1 bunch asparagus, trimmed",
      "1 tbsp olive oil",
      "1 lemon, sliced",
      "2 cloves garlic, minced",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "On a baking sheet, toss asparagus with olive oil, minced garlic, salt, and pepper.",
      "Place salmon fillets on the same baking sheet. Season with salt and pepper and top with lemon slices.",
      "Bake for 12-15 minutes, or until salmon is cooked through and asparagus is tender.",
      "Serve immediately with a fresh squeeze of lemon juice."
    ],
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop",
    nutrition: {
      calories: "450 kcal",
      protein: "40g",
      carbs: "10g",
      fat: "28g",
      sugar: "5g",
      sodium: "300mg"
    }
  },
  'chicken-stir-fry': {
    recipeName: "Classic Chicken Stir-Fry",
    description: "A versatile and flavorful stir-fry that's better than takeout. A perfect way to use up leftover veggies.",
    isHealthy: true,
    cuisine: "Asian",
    prepTime: "25 mins",
    difficulty: "intermediate",
    visualPrompt: "A colorful chicken stir-fry with tender golden-brown chicken chunks, bright green broccoli florets, and red bell pepper strips in a glossy, dark savory sauce, served over fluffy white rice.",
    ingredients: [
      "1 lb boneless, skinless chicken breast, cubed",
      "1 tbsp soy sauce",
      "1 tsp cornstarch",
      "2 tbsp vegetable oil, divided",
      "1 broccoli head, cut into florets",
      "1 red bell pepper, sliced",
      "1 carrot, julienned",
      "3 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "1/4 cup chicken broth",
      "2 tbsp oyster sauce",
      "Cooked rice for serving"
    ],
    instructions: [
      "In a bowl, toss chicken with soy sauce and cornstarch. Set aside.",
      "Heat 1 tbsp of oil in a wok or large skillet over high heat. Add chicken and cook until browned and cooked through. Remove from skillet.",
      "Add remaining 1 tbsp of oil to the skillet. Add broccoli, bell pepper, and carrot. Stir-fry for 3-4 minutes until crisp-tender.",
      "Add garlic and ginger and cook for another 30 seconds until fragrant.",
      "Return chicken to the skillet. In a small bowl, whisk together chicken broth and oyster sauce. Pour over the stir-fry and cook until the sauce thickens slightly.",
      "Serve hot over cooked rice."
    ],
    imageUrl: "https://images.unsplash.com/photo-1604329763328-3377157644a4?q=80&w=800&auto=format&fit=crop",
    nutrition: {
      calories: "550 kcal",
      protein: "45g",
      carbs: "35g",
      fat: "20g",
      sugar: "12g",
      sodium: "800mg"
    }
  },
  'lentil-soup': {
    recipeName: "Hearty Lentil Soup",
    description: "A cozy, comforting, and incredibly nutritious soup that's packed with plant-based protein and fiber.",
    isHealthy: true,
    cuisine: "Mediterranean",
    prepTime: "55 mins",
    difficulty: "beginner",
    visualPrompt: "A thick, earthy brown lentil soup in a ceramic bowl, garnished with fresh green parsley and a swirl of olive oil, with visible chunks of orange carrots and celery.",
    ingredients: [
      "1 tbsp olive oil",
      "1 large onion, chopped",
      "2 carrots, chopped",
      "2 celery stalks, chopped",
      "3 cloves garlic, minced",
      "1 tsp cumin",
      "1/2 tsp smoked paprika",
      "1 cup brown or green lentils, rinsed",
      "6 cups vegetable broth",
      "1 (14.5 oz) can diced tomatoes",
      "1 tsp dried thyme",
      "Salt and pepper to taste",
      "1 tbsp lemon juice",
      "Fresh parsley for garnish"
    ],
    instructions: [
      "Heat olive oil in a large pot or Dutch oven over medium heat. Add onion, carrots, and celery and cook until softened, about 5-7 minutes.",
      "Add garlic, cumin, and smoked paprika. Cook for 1 minute until fragrant.",
      "Stir in the rinsed lentils, vegetable broth, diced tomatoes, and thyme.",
      "Bring to a boil, then reduce heat and simmer for 40-50 minutes, or until lentils are tender.",
      "Season with salt and pepper to taste. Stir in lemon juice just before serving.",
      "Garnish with fresh parsley."
    ],
    imageUrl: "https://images.unsplash.com/photo-1608796982332-23cde4a7c123?q=80&w=800&auto=format&fit=crop",
    nutrition: {
      calories: "350 kcal",
      protein: "18g",
      carbs: "60g",
      fat: "5g",
      sugar: "10g",
      sodium: "650mg"
    }
  },
  'grilled-cheese': {
    recipeName: "Gourmet Grilled Cheese",
    description: "An indulgent, grown-up version of the classic comfort food, with sharp cheddar and a crispy, buttery crust.",
    isHealthy: false,
    cuisine: "American",
    prepTime: "10 mins",
    difficulty: "beginner",
    visualPrompt: "A perfectly toasted sourdough grilled cheese sandwich, cut diagonally to show the gooey, melted yellow cheddar and white Gruyère cheese stretching between the golden-brown crusts.",
    ingredients: [
      "2 thick slices of sourdough bread",
      "2 tbsp butter, softened",
      "2 oz sharp cheddar cheese, grated",
      "1 oz Gruyère cheese, grated",
      "Optional: 1 tsp Dijon mustard"
    ],
    instructions: [
      "Spread softened butter on one side of each slice of bread.",
      "Place one slice of bread, butter-side down, in a non-stick skillet over medium heat.",
      "If using, spread Dijon mustard on the unbuttered side.",
      "Top with the grated cheeses.",
      "Place the second slice of bread on top, butter-side up.",
      "Grill for 3-5 minutes per side, until the bread is golden brown and crispy, and the cheese is fully melted.",
      "Slice in half and serve immediately."
    ],
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c766?q=80&w=800&auto=format&fit=crop",
    nutrition: {
      calories: "600 kcal",
      protein: "25g",
      carbs: "40g",
      fat: "38g",
      sugar: "4g",
      sodium: "900mg"
    }
  },
  'creamy-tomato-pasta': {
    recipeName: "Creamy Tomato Pasta",
    description: "A simple yet elegant pasta dish with a rich and creamy tomato sauce. Perfect for a satisfying vegetarian dinner.",
    isHealthy: false,
    cuisine: "Italian",
    prepTime: "30 mins",
    difficulty: "beginner",
    visualPrompt: "Penne pasta coated in a rich, velvety orange-red tomato cream sauce, topped with fresh green basil leaves and a dusting of white Parmesan cheese.",
    ingredients: [
      "1 lb pasta (like penne or rigatoni)",
      "2 tbsp olive oil",
      "1 onion, chopped",
      "3 cloves garlic, minced",
      "1 (28 oz) can crushed tomatoes",
      "1/2 cup heavy cream",
      "1/2 tsp dried oregano",
      "Pinch of red pepper flakes",
      "Salt and pepper to taste",
      "Fresh basil and grated Parmesan for serving"
    ],
    instructions: [
      "Cook pasta according to package directions. Drain, reserving 1 cup of pasta water.",
      "While pasta cooks, heat olive oil in a large skillet. Add onion and cook until soft.",
      "Add garlic and red pepper flakes, cook for 1 minute until fragrant.",
      "Pour in crushed tomatoes, add oregano, salt, and pepper. Simmer for 15 minutes.",
      "Stir in the heavy cream and cook for another 2 minutes until heated through.",
      "Add the cooked pasta to the sauce, tossing to coat. If the sauce is too thick, add a splash of reserved pasta water.",
      "Serve immediately, topped with fresh basil and Parmesan cheese."
    ],
    imageUrl: "https://images.unsplash.com/photo-1598866594240-a31481152df5?q=80&w=800&auto=format&fit=crop",
    nutrition: {
      calories: "650 kcal", protein: "15g", carbs: "85g", fat: "28g", sugar: "12g", sodium: "700mg"
    }
  },
  'black-bean-burgers': {
    recipeName: "Flavorful Black Bean Burgers",
    description: "Hearty and delicious homemade veggie burgers that are packed with flavor and won't fall apart on the grill.",
    isHealthy: true,
    cuisine: "American",
    prepTime: "40 mins",
    difficulty: "intermediate",
    visualPrompt: "A hearty black bean burger patty on a toasted brioche bun, topped with a slice of melted cheese, fresh lettuce, a tomato slice, and creamy green avocado wedges.",
    ingredients: [
      "1 (15 oz) can black beans, rinsed and drained",
      "1/2 green bell pepper, chopped",
      "1/2 onion, chopped",
      "2 cloves garlic, minced",
      "1 egg",
      "1/2 cup bread crumbs",
      "1 tbsp chili powder",
      "1 tsp cumin",
      "Salt and pepper to taste",
      "Burger buns and toppings for serving"
    ],
    instructions: [
      "Preheat oven to 375°F (190°C). Mash the black beans in a large bowl until thick and pasty.",
      "In a separate pan, sauté bell pepper and onion until soft. Add garlic and cook for 1 more minute.",
      "Add the sautéed vegetables to the mashed beans. Stir in the egg, bread crumbs, chili powder, cumin, salt, and pepper.",
      "Mix until well combined. Form the mixture into 4 patties.",
      "Place patties on a lightly greased baking sheet and bake for 10-12 minutes on each side, until firm and heated through.",
      "Serve on buns with your favorite toppings like lettuce, tomato, and avocado."
    ],
    imageUrl: "https://images.unsplash.com/photo-1596956470007-2bf6095e7e16?q=80&w=800&auto=format&fit=crop",
    nutrition: {
      calories: "400 kcal", protein: "20g", carbs: "55g", fat: "10g", sugar: "8g", sodium: "500mg"
    }
  }
};
