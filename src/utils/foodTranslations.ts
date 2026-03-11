import { Language } from "@/contexts/LanguageContext";

// Common food translations dictionary
const foodTranslations: Record<string, Record<Language, string>> = {
  // Proteins
  "chicken": { en: "Chicken", fr: "Poulet", es: "Pollo", pt: "Frango", zh: "鸡肉", ar: "دجاج", it: "Pollo", de: "Hähnchen", nl: "Kip" },
  "grilled chicken": { en: "Grilled chicken", fr: "Poulet grillé", es: "Pollo a la parrilla", pt: "Frango grelhado", zh: "烤鸡", ar: "دجاج مشوي", it: "Pollo alla griglia", de: "Gegrilltes Hähnchen", nl: "Gegrilde kip" },
  "beef": { en: "Beef", fr: "Bœuf", es: "Carne de res", pt: "Carne bovina", zh: "牛肉", ar: "لحم بقري", it: "Manzo", de: "Rindfleisch", nl: "Rundvlees" },
  "steak": { en: "Steak", fr: "Steak", es: "Bistec", pt: "Bife", zh: "牛排", ar: "ستيك", it: "Bistecca", de: "Steak", nl: "Biefstuk" },
  "pork": { en: "Pork", fr: "Porc", es: "Cerdo", pt: "Porco", zh: "猪肉", ar: "لحم خنزير", it: "Maiale", de: "Schweinefleisch", nl: "Varkensvlees" },
  "fish": { en: "Fish", fr: "Poisson", es: "Pescado", pt: "Peixe", zh: "鱼", ar: "سمك", it: "Pesce", de: "Fisch", nl: "Vis" },
  "salmon": { en: "Salmon", fr: "Saumon", es: "Salmón", pt: "Salmão", zh: "三文鱼", ar: "سلمون", it: "Salmone", de: "Lachs", nl: "Zalm" },
  "tuna": { en: "Tuna", fr: "Thon", es: "Atún", pt: "Atum", zh: "金枪鱼", ar: "تونة", it: "Tonno", de: "Thunfisch", nl: "Tonijn" },
  "shrimp": { en: "Shrimp", fr: "Crevettes", es: "Camarones", pt: "Camarão", zh: "虾", ar: "روبيان", it: "Gamberi", de: "Garnelen", nl: "Garnalen" },
  "egg": { en: "Egg", fr: "Œuf", es: "Huevo", pt: "Ovo", zh: "鸡蛋", ar: "بيض", it: "Uovo", de: "Ei", nl: "Ei" },
  "eggs": { en: "Eggs", fr: "Œufs", es: "Huevos", pt: "Ovos", zh: "鸡蛋", ar: "بيض", it: "Uova", de: "Eier", nl: "Eieren" },
  "tofu": { en: "Tofu", fr: "Tofu", es: "Tofu", pt: "Tofu", zh: "豆腐", ar: "توفو", it: "Tofu", de: "Tofu", nl: "Tofu" },

  // Carbohydrates
  "rice": { en: "Rice", fr: "Riz", es: "Arroz", pt: "Arroz", zh: "米饭", ar: "أرز", it: "Riso", de: "Reis", nl: "Rijst" },
  "white rice": { en: "White rice", fr: "Riz blanc", es: "Arroz blanco", pt: "Arroz branco", zh: "白米饭", ar: "أرز أبيض", it: "Riso bianco", de: "Weißer Reis", nl: "Witte rijst" },
  "brown rice": { en: "Brown rice", fr: "Riz complet", es: "Arroz integral", pt: "Arroz integral", zh: "糙米", ar: "أرز بني", it: "Riso integrale", de: "Brauner Reis", nl: "Bruine rijst" },
  "pasta": { en: "Pasta", fr: "Pâtes", es: "Pasta", pt: "Massa", zh: "意大利面", ar: "معكرونة", it: "Pasta", de: "Pasta", nl: "Pasta" },
  "bread": { en: "Bread", fr: "Pain", es: "Pan", pt: "Pão", zh: "面包", ar: "خبز", it: "Pane", de: "Brot", nl: "Brood" },
  "potato": { en: "Potato", fr: "Pomme de terre", es: "Patata", pt: "Batata", zh: "土豆", ar: "بطاطس", it: "Patata", de: "Kartoffel", nl: "Aardappel" },
  "potatoes": { en: "Potatoes", fr: "Pommes de terre", es: "Patatas", pt: "Batatas", zh: "土豆", ar: "بطاطس", it: "Patate", de: "Kartoffeln", nl: "Aardappelen" },
  "french fries": { en: "French fries", fr: "Frites", es: "Papas fritas", pt: "Batatas fritas", zh: "薯条", ar: "بطاطس مقلية", it: "Patatine fritte", de: "Pommes frites", nl: "Frietjes" },
  "fries": { en: "Fries", fr: "Frites", es: "Papas fritas", pt: "Batatas fritas", zh: "薯条", ar: "بطاطس مقلية", it: "Patatine", de: "Pommes", nl: "Patat" },

  // Vegetables
  "vegetables": { en: "Vegetables", fr: "Légumes", es: "Verduras", pt: "Legumes", zh: "蔬菜", ar: "خضروات", it: "Verdure", de: "Gemüse", nl: "Groenten" },
  "mixed vegetables": { en: "Mixed vegetables", fr: "Légumes variés", es: "Verduras mixtas", pt: "Legumes mistos", zh: "混合蔬菜", ar: "خضروات مشكلة", it: "Verdure miste", de: "Gemischtes Gemüse", nl: "Gemengde groenten" },
  "salad": { en: "Salad", fr: "Salade", es: "Ensalada", pt: "Salada", zh: "沙拉", ar: "سلطة", it: "Insalata", de: "Salat", nl: "Salade" },
  "lettuce": { en: "Lettuce", fr: "Laitue", es: "Lechuga", pt: "Alface", zh: "生菜", ar: "خس", it: "Lattuga", de: "Salat", nl: "Sla" },
  "tomato": { en: "Tomato", fr: "Tomate", es: "Tomate", pt: "Tomate", zh: "番茄", ar: "طماطم", it: "Pomodoro", de: "Tomate", nl: "Tomaat" },
  "tomatoes": { en: "Tomatoes", fr: "Tomates", es: "Tomates", pt: "Tomates", zh: "番茄", ar: "طماطم", it: "Pomodori", de: "Tomaten", nl: "Tomaten" },
  "carrot": { en: "Carrot", fr: "Carotte", es: "Zanahoria", pt: "Cenoura", zh: "胡萝卜", ar: "جزر", it: "Carota", de: "Karotte", nl: "Wortel" },
  "carrots": { en: "Carrots", fr: "Carottes", es: "Zanahorias", pt: "Cenouras", zh: "胡萝卜", ar: "جزر", it: "Carote", de: "Karotten", nl: "Wortels" },
  "broccoli": { en: "Broccoli", fr: "Brocoli", es: "Brócoli", pt: "Brócolis", zh: "西兰花", ar: "بروكلي", it: "Broccoli", de: "Brokkoli", nl: "Broccoli" },
  "spinach": { en: "Spinach", fr: "Épinards", es: "Espinacas", pt: "Espinafre", zh: "菠菜", ar: "سبانخ", it: "Spinaci", de: "Spinat", nl: "Spinazie" },
  "onion": { en: "Onion", fr: "Oignon", es: "Cebolla", pt: "Cebola", zh: "洋葱", ar: "بصل", it: "Cipolla", de: "Zwiebel", nl: "Ui" },
  "pepper": { en: "Pepper", fr: "Poivron", es: "Pimiento", pt: "Pimentão", zh: "辣椒", ar: "فلفل", it: "Peperone", de: "Paprika", nl: "Paprika" },
  "cucumber": { en: "Cucumber", fr: "Concombre", es: "Pepino", pt: "Pepino", zh: "黄瓜", ar: "خيار", it: "Cetriolo", de: "Gurke", nl: "Komkommer" },
  "corn": { en: "Corn", fr: "Maïs", es: "Maíz", pt: "Milho", zh: "玉米", ar: "ذرة", it: "Mais", de: "Mais", nl: "Maïs" },
  "beans": { en: "Beans", fr: "Haricots", es: "Frijoles", pt: "Feijão", zh: "豆子", ar: "فاصوليا", it: "Fagioli", de: "Bohnen", nl: "Bonen" },
  "green beans": { en: "Green beans", fr: "Haricots verts", es: "Judías verdes", pt: "Feijão verde", zh: "四季豆", ar: "فاصوليا خضراء", it: "Fagiolini", de: "Grüne Bohnen", nl: "Sperziebonen" },
  "mushrooms": { en: "Mushrooms", fr: "Champignons", es: "Champiñones", pt: "Cogumelos", zh: "蘑菇", ar: "فطر", it: "Funghi", de: "Pilze", nl: "Champignons" },
  "avocado": { en: "Avocado", fr: "Avocat", es: "Aguacate", pt: "Abacate", zh: "牛油果", ar: "أفوكادو", it: "Avocado", de: "Avocado", nl: "Avocado" },

  // Fruits
  "apple": { en: "Apple", fr: "Pomme", es: "Manzana", pt: "Maçã", zh: "苹果", ar: "تفاح", it: "Mela", de: "Apfel", nl: "Appel" },
  "banana": { en: "Banana", fr: "Banane", es: "Plátano", pt: "Banana", zh: "香蕉", ar: "موز", it: "Banana", de: "Banane", nl: "Banaan" },
  "orange": { en: "Orange", fr: "Orange", es: "Naranja", pt: "Laranja", zh: "橙子", ar: "برتقال", it: "Arancia", de: "Orange", nl: "Sinaasappel" },
  "strawberry": { en: "Strawberry", fr: "Fraise", es: "Fresa", pt: "Morango", zh: "草莓", ar: "فراولة", it: "Fragola", de: "Erdbeere", nl: "Aardbei" },
  "grapes": { en: "Grapes", fr: "Raisins", es: "Uvas", pt: "Uvas", zh: "葡萄", ar: "عنب", it: "Uva", de: "Trauben", nl: "Druiven" },

  // Dairy
  "cheese": { en: "Cheese", fr: "Fromage", es: "Queso", pt: "Queijo", zh: "奶酪", ar: "جبن", it: "Formaggio", de: "Käse", nl: "Kaas" },
  "milk": { en: "Milk", fr: "Lait", es: "Leche", pt: "Leite", zh: "牛奶", ar: "حليب", it: "Latte", de: "Milch", nl: "Melk" },
  "yogurt": { en: "Yogurt", fr: "Yaourt", es: "Yogur", pt: "Iogurte", zh: "酸奶", ar: "زبادي", it: "Yogurt", de: "Joghurt", nl: "Yoghurt" },
  "butter": { en: "Butter", fr: "Beurre", es: "Mantequilla", pt: "Manteiga", zh: "黄油", ar: "زبدة", it: "Burro", de: "Butter", nl: "Boter" },

  // Sauces & condiments
  "sauce": { en: "Sauce", fr: "Sauce", es: "Salsa", pt: "Molho", zh: "酱汁", ar: "صلصة", it: "Salsa", de: "Soße", nl: "Saus" },
  "light sauce": { en: "Light sauce", fr: "Sauce légère", es: "Salsa ligera", pt: "Molho leve", zh: "清淡酱汁", ar: "صلصة خفيفة", it: "Salsa leggera", de: "Leichte Soße", nl: "Lichte saus" },
  "light sauce & extras": { en: "Light sauce & extras", fr: "Sauce légère et extras", es: "Salsa ligera y extras", pt: "Molho leve e extras", zh: "清淡酱汁和配料", ar: "صلصة خفيفة وإضافات", it: "Salsa leggera ed extra", de: "Leichte Soße & Extras", nl: "Lichte saus & extra's" },
  "ketchup": { en: "Ketchup", fr: "Ketchup", es: "Ketchup", pt: "Ketchup", zh: "番茄酱", ar: "كاتشب", it: "Ketchup", de: "Ketchup", nl: "Ketchup" },
  "mayonnaise": { en: "Mayonnaise", fr: "Mayonnaise", es: "Mayonesa", pt: "Maionese", zh: "蛋黄酱", ar: "مايونيز", it: "Maionese", de: "Mayonnaise", nl: "Mayonaise" },
  "mustard": { en: "Mustard", fr: "Moutarde", es: "Mostaza", pt: "Mostarda", zh: "芥末", ar: "خردل", it: "Senape", de: "Senf", nl: "Mosterd" },
  "olive oil": { en: "Olive oil", fr: "Huile d'olive", es: "Aceite de oliva", pt: "Azeite", zh: "橄榄油", ar: "زيت زيتون", it: "Olio d'oliva", de: "Olivenöl", nl: "Olijfolie" },

  // Drinks
  "water": { en: "Water", fr: "Eau", es: "Agua", pt: "Água", zh: "水", ar: "ماء", it: "Acqua", de: "Wasser", nl: "Water" },
  "coffee": { en: "Coffee", fr: "Café", es: "Café", pt: "Café", zh: "咖啡", ar: "قهوة", it: "Caffè", de: "Kaffee", nl: "Koffie" },
  "tea": { en: "Tea", fr: "Thé", es: "Té", pt: "Chá", zh: "茶", ar: "شاي", it: "Tè", de: "Tee", nl: "Thee" },
  "juice": { en: "Juice", fr: "Jus", es: "Jugo", pt: "Suco", zh: "果汁", ar: "عصير", it: "Succo", de: "Saft", nl: "Sap" },
  "orange juice": { en: "Orange juice", fr: "Jus d'orange", es: "Jugo de naranja", pt: "Suco de laranja", zh: "橙汁", ar: "عصير برتقال", it: "Succo d'arancia", de: "Orangensaft", nl: "Sinaasappelsap" },
  "soda": { en: "Soda", fr: "Soda", es: "Refresco", pt: "Refrigerante", zh: "汽水", ar: "مشروب غازي", it: "Bibita", de: "Limonade", nl: "Frisdrank" },

  // Common dishes
  "pizza": { en: "Pizza", fr: "Pizza", es: "Pizza", pt: "Pizza", zh: "披萨", ar: "بيتزا", it: "Pizza", de: "Pizza", nl: "Pizza" },
  "burger": { en: "Burger", fr: "Burger", es: "Hamburguesa", pt: "Hambúrguer", zh: "汉堡", ar: "برغر", it: "Hamburger", de: "Burger", nl: "Burger" },
  "hamburger": { en: "Hamburger", fr: "Hamburger", es: "Hamburguesa", pt: "Hambúrguer", zh: "汉堡", ar: "همبرغر", it: "Hamburger", de: "Hamburger", nl: "Hamburger" },
  "sandwich": { en: "Sandwich", fr: "Sandwich", es: "Sándwich", pt: "Sanduíche", zh: "三明治", ar: "ساندويتش", it: "Panino", de: "Sandwich", nl: "Broodje" },
  "soup": { en: "Soup", fr: "Soupe", es: "Sopa", pt: "Sopa", zh: "汤", ar: "شوربة", it: "Zuppa", de: "Suppe", nl: "Soep" },
  "sushi": { en: "Sushi", fr: "Sushi", es: "Sushi", pt: "Sushi", zh: "寿司", ar: "سوشي", it: "Sushi", de: "Sushi", nl: "Sushi" },
  "tacos": { en: "Tacos", fr: "Tacos", es: "Tacos", pt: "Tacos", zh: "墨西哥卷饼", ar: "تاكو", it: "Tacos", de: "Tacos", nl: "Taco's" },
  "noodles": { en: "Noodles", fr: "Nouilles", es: "Fideos", pt: "Macarrão", zh: "面条", ar: "نودلز", it: "Noodles", de: "Nudeln", nl: "Noedels" },
  "fried rice": { en: "Fried rice", fr: "Riz sauté", es: "Arroz frito", pt: "Arroz frito", zh: "炒饭", ar: "أرز مقلي", it: "Riso fritto", de: "Gebratener Reis", nl: "Gebakken rijst" },
  "omelette": { en: "Omelette", fr: "Omelette", es: "Tortilla", pt: "Omelete", zh: "煎蛋卷", ar: "أومليت", it: "Frittata", de: "Omelett", nl: "Omelet" },
  "pancakes": { en: "Pancakes", fr: "Crêpes", es: "Panqueques", pt: "Panquecas", zh: "煎饼", ar: "بان كيك", it: "Pancake", de: "Pfannkuchen", nl: "Pannenkoeken" },

  // Desserts
  "cake": { en: "Cake", fr: "Gâteau", es: "Pastel", pt: "Bolo", zh: "蛋糕", ar: "كعكة", it: "Torta", de: "Kuchen", nl: "Taart" },
  "ice cream": { en: "Ice cream", fr: "Glace", es: "Helado", pt: "Sorvete", zh: "冰淇淋", ar: "آيس كريم", it: "Gelato", de: "Eiscreme", nl: "IJs" },
  "chocolate": { en: "Chocolate", fr: "Chocolat", es: "Chocolate", pt: "Chocolate", zh: "巧克力", ar: "شوكولاتة", it: "Cioccolato", de: "Schokolade", nl: "Chocolade" },
  "cookie": { en: "Cookie", fr: "Biscuit", es: "Galleta", pt: "Biscoito", zh: "饼干", ar: "كوكيز", it: "Biscotto", de: "Keks", nl: "Koekje" },
  "cookies": { en: "Cookies", fr: "Biscuits", es: "Galletas", pt: "Biscoitos", zh: "饼干", ar: "كوكيز", it: "Biscotti", de: "Kekse", nl: "Koekjes" },

  // Nuts & seeds
  "nuts": { en: "Nuts", fr: "Noix", es: "Frutos secos", pt: "Nozes", zh: "坚果", ar: "مكسرات", it: "Noci", de: "Nüsse", nl: "Noten" },
  "almonds": { en: "Almonds", fr: "Amandes", es: "Almendras", pt: "Amêndoas", zh: "杏仁", ar: "لوز", it: "Mandorle", de: "Mandeln", nl: "Amandelen" },
  "peanuts": { en: "Peanuts", fr: "Cacahuètes", es: "Cacahuetes", pt: "Amendoins", zh: "花生", ar: "فول سوداني", it: "Arachidi", de: "Erdnüsse", nl: "Pinda's" },
};

/**
 * Translate a food name to the target language
 * Returns the original name if no translation is found
 */
export const translateFoodName = (name: string, language: Language): string => {
  const normalizedName = name.toLowerCase().trim();
  
  // Direct match
  if (foodTranslations[normalizedName]) {
    return foodTranslations[normalizedName][language];
  }
  
  // Try to find partial matches for compound names
  for (const [key, translations] of Object.entries(foodTranslations)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      // If the original seems to already be in the target language, return as-is
      if (translations[language].toLowerCase() === normalizedName) {
        return name;
      }
    }
  }
  
  // No translation found, return original
  return name;
};

/**
 * Check if a food name appears to be in English (for fallback detection)
 */
export const isEnglishFoodName = (name: string): boolean => {
  const normalizedName = name.toLowerCase().trim();
  
  for (const [key, translations] of Object.entries(foodTranslations)) {
    if (normalizedName === key || normalizedName === translations.en.toLowerCase()) {
      return true;
    }
  }
  
  return false;
};
