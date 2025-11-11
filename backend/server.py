from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import base64
import asyncio
from bson import ObjectId
import json

load_dotenv()

app = FastAPI(title="Grocery Detective API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = mongo_client.grocery_detective

# PayPal Config
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")

# ============= Models =============

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class UserPreferences(BaseModel):
    dietary_restrictions: List[str] = []
    allergens: List[str] = []
    health_goals: List[str] = []


class User(BaseModel):
    email: str
    name: str
    preferences: UserPreferences = UserPreferences()
    is_premium: bool = False
    scans_today: int = 0
    last_scan_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class IngredientAnalysis(BaseModel):
    ingredient: str
    harmful_score: int
    health_impact: str
    is_allergen: bool = False
    warnings: List[str] = []


class ProductAnalysis(BaseModel):
    overall_score: int
    recommendation: str
    ingredients: List[IngredientAnalysis]
    health_benefits: List[str]
    concerns: List[str]
    personalized_advice: str


class ScanRequest(BaseModel):
    user_id: str
    barcode: Optional[str] = None
    ingredients_text: Optional[str] = None
    image_base64: Optional[str] = None


class AnalyzeIngredientsRequest(BaseModel):
    user_id: str
    ingredients_text: str


class UpdatePreferencesRequest(BaseModel):
    user_id: str
    dietary_restrictions: List[str] = []
    allergens: List[str] = []
    health_goals: List[str] = []


class SubscriptionRequest(BaseModel):
    user_id: str
    payment_id: str
    plan_type: str


# ============= AI Analysis Service =============

class AIAnalysisService:
    def __init__(self):
        self.harmful_ingredients = {
            'sodium nitrite': {'score': 95, 'impact': 'Forms nitrosamines, linked to cancer'},
            'bht': {'score': 90, 'impact': 'Potential carcinogen, hormone disruptor'},
            'bha': {'score': 92, 'impact': 'Potential carcinogen, endocrine disruptor'},
            'red dye 40': {'score': 85, 'impact': 'Linked to hyperactivity, allergic reactions'},
            'yellow 5': {'score': 85, 'impact': 'Allergic reactions, hyperactivity'},
            'yellow 6': {'score': 85, 'impact': 'May cause hyperactivity'},
            'blue 1': {'score': 82, 'impact': 'Possible allergen, hyperactivity concerns'},
            'tbhq': {'score': 88, 'impact': 'Vision disturbances, potential carcinogen'},
            'phosphoric acid': {'score': 80, 'impact': 'Bone density loss, tooth damage'},
            'sodium benzoate': {'score': 70, 'impact': 'Forms benzene with vitamin C'},
            'aspartame': {'score': 75, 'impact': 'Potential neurotoxin'},
            'carrageenan': {'score': 70, 'impact': 'Digestive inflammation'},
            'high fructose corn syrup': {'score': 65, 'impact': 'Obesity, diabetes risk'},
            'msg': {'score': 60, 'impact': 'Headaches in sensitive individuals'},
            'monosodium glutamate': {'score': 60, 'impact': 'Headaches, nausea'},
        }
        
        self.common_allergens = [
            'milk', 'eggs', 'peanuts', 'tree nuts', 'soy', 'wheat', 
            'fish', 'shellfish', 'sesame', 'mustard', 'celery', 'lupin'
        ]

    async def analyze_with_ai(self, ingredients_text: str, user_preferences: UserPreferences) -> ProductAnalysis:
        """Analyze ingredients using OpenAI GPT-4o"""
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            api_key = os.getenv("EMERGENT_LLM_KEY")
            
            # Create system message for ingredient analysis
            system_message = f"""
You are a professional nutritionist analyzing food ingredients. 

User Dietary Restrictions: {', '.join(user_preferences.dietary_restrictions) if user_preferences.dietary_restrictions else 'None'}
User Allergens: {', '.join(user_preferences.allergens) if user_preferences.allergens else 'None'}
User Health Goals: {', '.join(user_preferences.health_goals) if user_preferences.health_goals else 'None'}

Analyze the ingredients and provide:
1. Overall health score (0-100, where 100 is healthiest)
2. Individual ingredient analysis with harmful scores
3. Health benefits
4. Concerns
5. Personalized advice based on user preferences
6. Recommendation (recommended/neutral/not-recommended)

Format your response as JSON with this structure:
{{
  "overall_score": <number>,
  "recommendation": "<recommended|neutral|not-recommended>",
  "ingredients": [
    {{
      "ingredient": "<name>",
      "harmful_score": <0-100>,
      "health_impact": "<description>",
      "is_allergen": <boolean>,
      "warnings": ["<warning1>", "<warning2>"]
    }}
  ],
  "health_benefits": ["<benefit1>", "<benefit2>"],
  "concerns": ["<concern1>", "<concern2>"],
  "personalized_advice": "<advice text>"
}}
"""
            
            chat = LlmChat(
                api_key=api_key,
                session_id=f"analysis_{datetime.utcnow().timestamp()}",
                system_message=system_message
            ).with_model("openai", "gpt-4o")
            
            user_message = UserMessage(
                text=f"Analyze these ingredients:\n\n{ingredients_text}"
            )
            
            response = await chat.send_message(user_message)
            
            # Parse JSON response
            response_text = response.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            analysis_data = json.loads(response_text.strip())
            
            return ProductAnalysis(**analysis_data)
            
        except Exception as e:
            print(f"AI analysis error: {e}")
            # Fallback to rule-based analysis
            return self.analyze_ingredients_fallback(ingredients_text, user_preferences)

    def analyze_ingredients_fallback(self, ingredients_text: str, user_preferences: UserPreferences) -> ProductAnalysis:
        """Fallback rule-based analysis"""
        ingredients = [i.strip().lower() for i in ingredients_text.split(',')]
        
        analyzed_ingredients = []
        total_harmful_score = 0
        concerns = []
        health_benefits = []
        
        for ingredient in ingredients:
            harmful_score = 0
            health_impact = "No known issues"
            is_allergen = False
            warnings = []
            
            # Check harmful ingredients
            for harmful_name, info in self.harmful_ingredients.items():
                if harmful_name in ingredient:
                    harmful_score = info['score']
                    health_impact = info['impact']
                    concerns.append(f"{ingredient.title()}: {health_impact}")
                    warnings.append(health_impact)
                    break
            
            # Check allergens
            for allergen in self.common_allergens:
                if allergen in ingredient and allergen in [a.lower() for a in user_preferences.allergens]:
                    is_allergen = True
                    warnings.append(f"Contains {allergen.title()} - listed in your allergens")
                    concerns.append(f"ALLERGEN WARNING: Contains {allergen.title()}")
            
            analyzed_ingredients.append(
                IngredientAnalysis(
                    ingredient=ingredient.title(),
                    harmful_score=harmful_score,
                    health_impact=health_impact,
                    is_allergen=is_allergen,
                    warnings=warnings
                )
            )
            
            total_harmful_score += harmful_score
        
        # Calculate overall score
        avg_harmful = total_harmful_score / len(ingredients) if ingredients else 0
        overall_score = max(0, 100 - int(avg_harmful))
        
        # Recommendation
        if overall_score >= 70:
            recommendation = "recommended"
            health_benefits.append("Generally safe ingredients")
        elif overall_score >= 40:
            recommendation = "neutral"
            health_benefits.append("Moderate ingredient quality")
        else:
            recommendation = "not-recommended"
            concerns.append("Contains multiple concerning ingredients")
        
        # Personalized advice
        advice_parts = []
        if any(i.is_allergen for i in analyzed_ingredients):
            advice_parts.append("⚠️ CONTAINS YOUR ALLERGENS - Avoid this product")
        if overall_score < 50:
            advice_parts.append("Consider healthier alternatives with fewer additives")
        if not concerns:
            advice_parts.append("This product appears safe for your dietary needs")
        
        personalized_advice = " ".join(advice_parts) if advice_parts else "No specific concerns for your profile"
        
        return ProductAnalysis(
            overall_score=overall_score,
            recommendation=recommendation,
            ingredients=analyzed_ingredients,
            health_benefits=health_benefits,
            concerns=concerns,
            personalized_advice=personalized_advice
        )


ai_service = AIAnalysisService()


# ============= API Routes =============

@app.get("/api")
async def root():
    return {"message": "Grocery Detective API", "version": "1.0.0"}


@app.post("/api/users")
async def create_user(user: User):
    """Create a new user"""
    user_dict = user.dict()
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    return user_dict


@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["_id"] = str(user["_id"])
    return user


@app.post("/api/users/preferences")
async def update_preferences(request: UpdatePreferencesRequest):
    """Update user preferences"""
    if not ObjectId.is_valid(request.user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    result = await db.users.update_one(
        {"_id": ObjectId(request.user_id)},
        {"$set": {
            "preferences.dietary_restrictions": request.dietary_restrictions,
            "preferences.allergens": request.allergens,
            "preferences.health_goals": request.health_goals
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "Preferences updated"}


@app.post("/api/analyze-ingredients")
async def analyze_ingredients(request: AnalyzeIngredientsRequest):
    """Analyze ingredients using AI"""
    if not ObjectId.is_valid(request.user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Get user
    user = await db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check scan limits for free users
    today = datetime.utcnow().date().isoformat()
    if user.get("last_scan_date") != today:
        await db.users.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$set": {"scans_today": 0, "last_scan_date": today}}
        )
        user["scans_today"] = 0
    
    if not user.get("is_premium", False) and user.get("scans_today", 0) >= 5:
        raise HTTPException(
            status_code=403, 
            detail="Daily scan limit reached. Upgrade to premium for unlimited scans."
        )
    
    # Analyze ingredients
    preferences = UserPreferences(**user.get("preferences", {}))
    analysis = await ai_service.analyze_with_ai(request.ingredients_text, preferences)
    
    # Save scan
    scan_data = {
        "user_id": request.user_id,
        "ingredients_text": request.ingredients_text,
        "analysis": analysis.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    await db.scans.insert_one(scan_data)
    
    # Update scan count
    await db.users.update_one(
        {"_id": ObjectId(request.user_id)},
        {"$inc": {"scans_today": 1}}
    )
    
    return analysis


@app.get("/api/users/{user_id}/scans")
async def get_scan_history(user_id: str, limit: int = 20):
    """Get user's scan history"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    scans = await db.scans.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    for scan in scans:
        scan["_id"] = str(scan["_id"])
    
    return scans


@app.post("/api/payment/create-subscription")
async def create_subscription(request: SubscriptionRequest):
    """Create PayPal subscription"""
    if not ObjectId.is_valid(request.user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # In production, verify payment with PayPal API
    # For now, we'll trust the payment_id from frontend
    
    # Update user to premium
    result = await db.users.update_one(
        {"_id": ObjectId(request.user_id)},
        {"$set": {"is_premium": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Save subscription
    subscription_data = {
        "user_id": request.user_id,
        "payment_id": request.payment_id,
        "plan_type": request.plan_type,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat()
    }
    await db.subscriptions.insert_one(subscription_data)
    
    return {"success": True, "message": "Subscription activated"}


@app.get("/api/payment/config")
async def get_paypal_config():
    """Get PayPal client ID for frontend"""
    return {
        "client_id": PAYPAL_CLIENT_ID,
        "currency": "USD"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
