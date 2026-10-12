import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// Helper function to handle transient Gemini API errors (like 503 UNAVAILABLE or 429 Rate Limits) 
// and gracefully fall back to alternative robust models in the supported Gemini Flash family.
async function generateContentWithRetry(ai: any, options: {
  model: string;
  contents: any;
  config?: any;
}) {
  const validModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  const preferredModel = options.model && validModels.includes(options.model) ? options.model : "gemini-3.8-flash";
  const modelsToTry = [
    preferredModel,
    ...validModels.filter(m => m !== preferredModel)
  ];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...options,
        model: modelName
      });
      return response;
    } catch (e: any) {
      lastError = e;
      console.warn(`Model ${modelName} encountered error: ${e.message || e}. Falling back to next available model.`);
      // Immediately proceed to the next fallback model for fastest recovery without stalling
    }
  }
  throw lastError || new Error("Failed to generate content after attempting available Gemini models.");
}

// Helper to parse image MIME type and clean raw base64 data from either full data URL or raw base64
function parseImageData(dataUrlOrBase64: string): { mimeType: string; base64Data: string } {
  if (!dataUrlOrBase64 || typeof dataUrlOrBase64 !== 'string') {
    return { mimeType: "image/jpeg", base64Data: "" };
  }

  const clean = dataUrlOrBase64.trim();
  if (clean.startsWith("data:")) {
    const commaIndex = clean.indexOf(",");
    if (commaIndex !== -1) {
      const mimeTypeMatch = clean.slice(0, commaIndex).match(/^data:([^;]+)/i);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1].trim() : "image/jpeg";
      const base64Data = clean.slice(commaIndex + 1).replace(/\s+/g, '');
      return { mimeType, base64Data };
    }
  }

  return {
    mimeType: "image/jpeg",
    base64Data: clean.replace(/\s+/g, '')
  };
}

// Resilient JSON parsers to prevent crashes on truncated or slightly imperfect LLM outputs
function safeParseJsonArray(str: string): any[] {
  if (!str) return [];
  try {
    const cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // Attempt recovery of valid JSON objects inside the partial/truncated array
    const matches = str.match(/\{[^{}]*\}/g);
    if (matches && matches.length > 0) {
      const items: any[] = [];
      for (const m of matches) {
        try {
          items.push(JSON.parse(m));
        } catch (_) {}
      }
      return items;
    }
    return [];
  }
}

function safeParseJsonObject(str: string, fallback: any = {}): any {
  if (!str) return fallback;
  try {
    const cleaned = str.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return fallback;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON parsing middleware with generous limit for image uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ limit: '25mb', extended: true }));

  // Initialize Gemini client (server-side only)
  // We MUST set the User-Agent header to 'aistudio-build' in httpOptions for telemetry.
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("The master chef's pantry is missing its secret key (API Key). Please configure it in Settings > Secrets.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // 1. API route: generateRecipeText
  app.post("/api/recipes", async (req, res) => {
    try {
      const { ingredients, preferences, personality, language } = req.body;
      const ai = getAiClient();

      const systemInstruction = `You are You, Chef (branded as YouChef), a constrained recipe-generation assistant operating under strict ingredient validation. 
      
RULES FOR INGREDIENTS:
1. You MUST generate recipes using ONLY the exact ingredients explicitly provided by the user.
2. Any ingredient not listed is FORBIDDEN and must not appear anywhere in the recipe (no water, no oil, no salt, no pepper, no vegetables, no spices) unless they are in the user's provided list.
3. You must internally verify that every ingredient referenced appears in the allowed list; if a traditional recipe requires missing ingredients, you MUST remove or adapt them.
4. Clearly state the limitations in the description without introducing new items (e.g., "Note: Prepared without seasoning as no spices were provided").
5. The "visualPrompt" field MUST ONLY describe visual elements and ingredients that are present in this recipe. It is STRICTLY FORBIDDEN to describe or include any unallowed garnishes (such as parsley, sesame seeds, chopped herbs) or side dishes (such as rice, salad, bread) unless they are in the provided list.

SKILL LEVEL ENFORCEMENT (${preferences?.skillLevel?.toUpperCase() || 'BEGINNER'}):
- Beginner: Use simple steps but remain specific with measurements and temperatures. Focus on basic heat and assembly.
- Intermediate: Use moderate techniques (timing coordination, specific prep methods like sautéing or reduction).
- Expert: Use advanced professional terminology (emulsify, julienne, deglaze) and complex techniques.

PRECISION & DETAIL:
- Be highly descriptive and specific in every cooking step.
- Include exact temperatures (e.g., 375°F / 190°C), precise weight/volume measurements (e.g., 1.5 cups, 15ml, 200g), and specific tool settings.
- Specify exact timings (e.g., "Whisk for exactly 2 minutes") and provide sensory cues for success.

OUTPUT:
- Generate EXACTLY 3 recipes.
- Language: ${language === 'es' ? 'Spanish' : 'English'}.
- Personalize based on Chef Personality: ${personality}.`;

      const RECIPE_SCHEMA = {
          type: Type.ARRAY,
          description: "A list of structured recipe objects",
          items: {
              type: Type.OBJECT,
              properties: {
                  recipeName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  isHealthy: { type: Type.BOOLEAN },
                  cuisine: { type: Type.STRING },
                  prepTime: { type: Type.STRING },
                  difficulty: { type: Type.STRING, description: "One of: beginner, intermediate, expert" },
                  visualPrompt: { type: Type.STRING, description: "A detailed visual description of the finished dish for an image generator. Focus on colors, textures, and the specific ingredients used." },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  nutrition: {
                      type: Type.OBJECT,
                      properties: {
                          calories: { type: Type.STRING },
                          protein: { type: Type.STRING },
                          carbs: { type: Type.STRING },
                          fat: { type: Type.STRING }
                      },
                      required: ["calories", "protein", "carbs", "fat"]
                  }
              },
              required: ["recipeName", "description", "ingredients", "instructions", "nutrition", "prepTime", "difficulty", "visualPrompt"]
          }
      };

      const dietaryRestrictions = [
          preferences?.isGlutenFree ? 'Gluten-Free' : null,
          preferences?.isVegan ? 'Vegan' : null,
          preferences?.isVegetarian ? 'Vegetarian' : null,
          preferences?.isKeto ? 'Keto' : null,
          preferences?.isDairyFree ? 'Dairy-Free' : null,
          preferences?.allergies ? `Allergies: ${preferences.allergies}` : null
      ].filter(Boolean).join(', ');

      const response = await generateContentWithRetry(ai, {
          model: "gemini-3.8-flash",
          contents: `Ingredients: ${ingredients.join(', ')}. Skill Level: ${preferences?.skillLevel || 'beginner'}. Dietary: ${dietaryRestrictions || 'None'}. Tools: ${preferences?.equipment?.join(', ') || 'standard kitchen'}.`,
          config: {
              responseMimeType: "application/json",
              responseSchema: RECIPE_SCHEMA,
              systemInstruction,
              temperature: 0.1
          }
      });

      const text = response.text || "[]";
      res.json(safeParseJsonArray(text));
    } catch (e: any) {
      console.error("API error /api/recipes:", e);
      if (e.message?.includes('429') || e.message?.toLowerCase().includes('rate')) {
        res.status(429).json({ error: "The Chef's kitchen is too busy right now (Rate Limit Exceeded). Please wait a minute before requesting more recipes." });
      } else {
        res.status(500).json({ error: e.message || "Culinary intuition blocked. Try again." });
      }
    }
  });

  // 2. API route: getChefSecret
  app.post("/api/chef-secret", async (req, res) => {
    try {
      const { recipeName, ingredients, personality, language } = req.body;
      const ai = getAiClient();

      const response = await generateContentWithRetry(ai, {
          model: "gemini-3.8-flash",
          contents: `Explain one professional culinary technique for ${recipeName} using ONLY these ingredients: ${ingredients.slice(0, 5).join(', ')}. Personality: ${personality}. Language: ${language === 'es' ? 'Spanish' : 'English'}.`,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      technique: { type: Type.STRING },
                      enhancement: { type: Type.STRING }
                  },
                  required: ["technique", "enhancement"]
              }
          }
      });

      const text = response.text || "{}";
      res.json(safeParseJsonObject(text, { technique: "Mise en Place", enhancement: "Organize your limited ingredients before starting." }));
    } catch (e: any) {
      console.error("API error /api/chef-secret:", e);
      res.json({ technique: "Mise en Place", enhancement: "Organize your limited ingredients before starting to ensure the best result." });
    }
  });

  // 3. API route: generateRecipeImage
  app.post("/api/recipe-image", async (req, res) => {
    const { recipe } = req.body;
    try {
      const ai = getAiClient();

      const prompt = `Professional food photography of ${recipe.recipeName}.
      
STRICT VISUAL REQUIREMENT:
The dish MUST ONLY contain these visual ingredients: ${recipe.ingredients.join(', ')}.
DO NOT include any other ingredients, garnishes, side dishes, sauces, or seasonings that are not in this list. 
No unlisted vegetables, no herbs (no parsley, no cilantro, no green onion), no unlisted starches (no rice, no bread, no pasta, no sesame seeds, no lemon slices) unless they are explicitly in the ingredient list: ${recipe.ingredients.join(', ')}.
Keep the composition elegant, minimalist, and clean. Place the dish on a simple, modern plate or bowl on a neutral background.

${recipe.visualPrompt ? `Additional aesthetic details: ${recipe.visualPrompt}` : ''}

Style: Appetizing, macro photography, soft studio lighting, shallow depth of field, high resolution, 4k.`;

      const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: { parts: [{ text: prompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        res.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
      } else {
        // Dynamic fallback matching recipe ingredients
        const query = recipe ? [recipe.recipeName, ...recipe.ingredients.slice(0, 2)].join(',') : 'gourmet food';
        res.json({ imageUrl: `https://images.unsplash.com/featured/800x800/?${encodeURIComponent(query)}` });
      }
    } catch (e: any) {
      console.error("API error /api/recipe-image:", e);
      const query = recipe ? [recipe.recipeName, ...recipe.ingredients.slice(0, 2)].join(',') : 'gourmet food';
      res.json({ imageUrl: `https://images.unsplash.com/featured/800x800/?${encodeURIComponent(query)}` });
    }
  });

  // 4. API route: critiqueUserDish
  app.post("/api/critique", async (req, res) => {
    try {
      const { base64Image, recipeName, personality } = req.body;
      const ai = getAiClient();
      const { mimeType, base64Data } = parseImageData(base64Image);

      const response = await generateContentWithRetry(ai, {
          model: "gemini-3.8-flash",
          contents: {
              parts: [
                  { inlineData: { mimeType, data: base64Data } },
                  { text: `As Chef ${personality}, critique this dish: ${recipeName}. Provide a score 1-100.` }
              ]
          },
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      score: { type: Type.NUMBER },
                      critique: { type: Type.STRING }
                  },
                  required: ["score", "critique"]
              }
          }
      });

      const text = response.text || '{"score": 80, "critique": "Good effort."}';
      res.json(safeParseJsonObject(text, { score: 80, critique: "Good effort." }));
    } catch (e: any) {
      console.error("API error /api/critique:", e);
      res.json({ score: 85, critique: "Wonderful effort! The colors are vibrant." });
    }
  });

  // 5. API route: scanReceipt
  app.post("/api/scan-receipt", async (req, res) => {
    try {
      const base64Image = req.body.base64Image || req.body.image;
      if (!base64Image) {
        return res.status(400).json({ error: "No image provided. Please capture or upload a grocery receipt." });
      }
      const ai = getAiClient();
      const { mimeType, base64Data } = parseImageData(base64Image);
      if (!base64Data) {
        return res.status(400).json({ error: "Invalid image format. Please upload a valid image file." });
      }

      const systemInstruction = `You are an expert grocery receipt reader. Your task is to process an image of a grocery purchase receipt.
Analyze the receipt line by line and identify all food products, ingredients, spices, and household cooking materials.
Return them as a structured list.

STRICT INSTRUCTIONS:
1. Ignore non-food items, taxes, bags, fees, magazines, toiletries, or general household cleaners.
2. Clean up cryptic abbreviations on the receipt to standard, lowercase kitchen ingredient names (e.g. "CHCKN BRST FLT" -> "chicken breast", "ORG BABY SPIN" -> "baby spinach", "MILK 2% 1G" -> "milk").
3. Estimate a reasonable shelf life in days (expiresInDays) based on typical food science and pantry preservation guidelines starting from today (e.g., 3 days for fresh fish/poultry, 7 days for milk/cheese, 14 days for apples, 180 days for canned beans, grains, or dry spices).
4. Extract the purchase quantity or estimate it in a human-readable format (e.g. "1 pack", "500g", "3 units", "1 bottle").
5. If the image does not clearly depict a receipt or has no recognizable food items, return an empty array [].
6. Extract at most 35 distinct items. Never repeat identical items.`;

      const RECEIPT_SCHEMA = {
          type: Type.ARRAY,
          description: "A list of grocery items identified from the receipt",
          items: {
              type: Type.OBJECT,
              properties: {
                  name: { type: Type.STRING, description: "Standard, clean ingredient name, e.g. 'chicken breast', 'baby spinach', 'milk', 'eggs'" },
                  quantity: { type: Type.STRING, description: "Estimated quantity, e.g., '1 pack', '500g', '6 pieces'" },
                  expiresInDays: { type: Type.INTEGER, description: "Estimated number of shelf-life days from today (e.g. 3, 7, 14, 180)" }
              },
              required: ["name", "quantity", "expiresInDays"]
          }
      };

      const response = await generateContentWithRetry(ai, {
          model: "gemini-3.8-flash",
          contents: {
              parts: [
                  { inlineData: { mimeType, data: base64Data } },
                  { text: `Process this grocery receipt image and extract the food items. If this is not a receipt or contains no food items, return [].` }
              ]
          },
          config: {
              responseMimeType: "application/json",
              responseSchema: RECEIPT_SCHEMA,
              systemInstruction,
              temperature: 0.1
          }
      });

      const text = response.text || "[]";
      res.json(safeParseJsonArray(text));
    } catch (e: any) {
      console.error("API error /api/scan-receipt:", e);
      if (e.message?.includes("INVALID_ARGUMENT") || e.message?.toLowerCase().includes("unable to process input image")) {
        return res.status(422).json({ error: "The image could not be processed. Please upload a clear photo of your receipt." });
      }
      res.status(500).json({ error: e.message || "Failed to parse receipt." });
    }
  });

  // 6. API route: scanFridge
  app.post("/api/scan-fridge", async (req, res) => {
    try {
      const base64Image = req.body.base64Image || req.body.image;
      if (!base64Image) {
        return res.status(400).json({ error: "No image provided. Please capture or upload a fridge or pantry photo." });
      }
      const ai = getAiClient();
      const { mimeType, base64Data } = parseImageData(base64Image);
      if (!base64Data) {
        return res.status(400).json({ error: "Invalid image format. Please upload a valid image file." });
      }

      const systemInstruction = `You are a kitchen inventory AI. Your task is to look at a photo of the inside of a refrigerator, freezer, or kitchen pantry.
Identify all visible ingredients, food items, and estimate their general quantities (e.g., '1 half carton', '3 units', '1 bowl', 'some').
Return them as a structured list.

STRICT INSTRUCTIONS:
1. Only identify edible food items, condiments, or ingredients.
2. Provide a generic, lowercase name for each item.
3. Estimate its quantity in a human-friendly format.
4. If no edible items or ingredients are visible in the image, return [].
5. Extract at most 35 distinct items.`;

      const FRIDGE_SCHEMA = {
          type: Type.ARRAY,
          description: "A list of food items identified in the fridge/pantry",
          items: {
              type: Type.OBJECT,
              properties: {
                  name: { type: Type.STRING, description: "Lowercase generic name of the item, e.g. 'egg', 'milk', 'ketchup', 'broccoli'" },
                  quantity: { type: Type.STRING, description: "Estimated visible quantity, e.g. '1 carton', 'half jar', 'some'" }
              },
              required: ["name", "quantity"]
          }
      };

      const response = await generateContentWithRetry(ai, {
          model: "gemini-3.8-flash",
          contents: {
              parts: [
                  { inlineData: { mimeType, data: base64Data } },
                  { text: `Identify all food items inside this fridge or pantry. If none visible, return [].` }
              ]
          },
          config: {
              responseMimeType: "application/json",
              responseSchema: FRIDGE_SCHEMA,
              systemInstruction,
              temperature: 0.1
          }
      });

      const text = response.text || "[]";
      res.json(safeParseJsonArray(text));
    } catch (e: any) {
      console.error("API error /api/scan-fridge:", e);
      if (e.message?.includes("INVALID_ARGUMENT") || e.message?.toLowerCase().includes("unable to process input image")) {
        return res.status(422).json({ error: "The photo could not be processed. Please provide a clear picture of your fridge or ingredients." });
      }
      res.status(500).json({ error: e.message || "Failed to scan fridge." });
    }
  });

  // Vite middleware for development or static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
