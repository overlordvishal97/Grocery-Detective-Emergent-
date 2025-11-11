# 🕵️‍♀️ Grocery Detective - AI-Powered Food Product Scanner

**Unmask Your Groceries. Understand What You Eat.**

A professional mobile app built with Expo React Native that scans product barcodes and ingredient labels to provide AI-powered health analysis.

## 🎯 Features

### Core Features ✅
- **📱 Barcode Scanner**: Scan product barcodes using device camera
- **🔍 Ingredient Label Scanner**: OCR-capable ingredient text scanning
- **🤖 AI Analysis**: GPT-4o powered ingredient analysis
- **⚠️ Allergen Detection**: Personalized allergen warnings
- **📊 Health Scoring**: 0-100 health score for each product
- **👤 User Profiles**: Save dietary restrictions and preferences
- **⭐ Premium Plans**: PayPal-integrated subscription ($1.99/month)
- **📝 Scan History**: Track all your scanned products

### Premium Features 💎
- Unlimited scans (free: 5/day)
- Advanced AI analysis
- Health analytics
- Family profiles
- Personalized meal plans
- Ad-free experience

## 🏗️ Tech Stack

### Frontend
- **Expo** - Cross-platform mobile development
- **React Native** - Native mobile UI
- **expo-router** - File-based routing
- **expo-camera** - Camera access
- **expo-barcode-scanner** - Barcode scanning
- **TypeScript** - Type safety

### Backend
- **FastAPI** (Python) - REST API
- **MongoDB** - Database
- **OpenAI GPT-4o** - AI ingredient analysis
- **emergentintegrations** - LLM integration library

### Payment
- **PayPal** - Subscription payments

## 📂 Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI backend
│   ├── .env                # Environment variables
│   └── requirements.txt    # Python dependencies
│
└── frontend/
    ├── app/
    │   ├── index.tsx       # Home screen
    │   ├── scanner.tsx     # Camera scanner
    │   ├── results.tsx     # Analysis results
    │   ├── profile.tsx     # User profile
    │   ├── premium.tsx     # Premium upgrade
    │   ├── history.tsx     # Scan history
    │   └── _layout.tsx     # Navigation layout
    ├── app.json            # Expo configuration
    └── package.json        # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js & Yarn
- Python 3.11+
- MongoDB (running locally or remote)
- PayPal Developer Account (for payments)
- Emergent LLM Key (for AI analysis)

### Installation

1. **Backend Setup**
```bash
cd /app/backend
pip install -r requirements.txt
python server.py
```

2. **Frontend Setup**
```bash
cd /app/frontend
yarn install
yarn start
```

3. **Access the App**
- Web: http://localhost:3000
- Mobile: Scan QR code with Expo Go app

## 📱 How to Use

### 1. First Time Setup
- App automatically creates a user profile
- Configure dietary restrictions and allergens in Profile

### 2. Scanning Products

**Method 1: Barcode Scan**
1. Tap "Scan Product" on home screen
2. Position barcode in camera frame
3. Wait for automatic detection

**Method 2: Ingredient Label**
1. Switch to "Ingredients" mode in scanner
2. Capture photo of ingredient list
3. Or tap "Manual Entry" to type ingredients

**Method 3: Manual Entry**
1. From scanner, tap pencil icon
2. Type ingredients separated by commas
3. Tap "Analyze Ingredients"

### 3. View Results
- **Health Score**: 0-100 (higher is better)
- **Recommendation**: Recommended/Neutral/Not Recommended
- **Personalized Advice**: Based on your preferences
- **Ingredient Breakdown**: Individual analysis for each ingredient
- **Allergen Warnings**: Highlighted in red

### 4. Manage Preferences
- Go to Profile
- Add allergens to avoid
- Select dietary restrictions (Vegan, Gluten-Free, etc.)
- Add custom allergens

### 5. Upgrade to Premium
- Tap premium banner or go to Premium screen
- Choose $1.99/month plan
- Complete PayPal payment
- Enjoy unlimited scans!

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017/grocery_detective
EMERGENT_LLM_KEY=sk-emergent-xxxx
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox
```

**Frontend (.env)**
```env
EXPO_PUBLIC_BACKEND_URL=http://your-backend-url
```

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:8001/api

# Create user
curl -X POST http://localhost:8001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","preferences":{}}'

# Analyze ingredients
curl -X POST http://localhost:8001/api/analyze-ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"YOUR_USER_ID",
    "ingredients_text":"Water, Sugar, Salt, Citric Acid"
  }'
```

## 📊 API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users/{user_id}` - Get user
- `POST /api/users/preferences` - Update preferences

### Analysis
- `POST /api/analyze-ingredients` - Analyze ingredients with AI
- `GET /api/users/{user_id}/scans` - Get scan history

### Payment
- `GET /api/payment/config` - Get PayPal config
- `POST /api/payment/create-subscription` - Create subscription

## 🎨 UI/UX Highlights

- **Mobile-First Design**: Optimized for thumb-friendly navigation
- **Beautiful Animations**: Smooth transitions between screens
- **Intuitive Navigation**: Tab-based with expo-router
- **Professional UI**: Modern, clean, and accessible
- **Dark Mode Ready**: Automatic theme switching
- **Safe Areas**: Proper handling of notches and system UI

## 🔐 Security Features

- Secure PayPal integration
- Encrypted API communications
- User data privacy
- Allergen warnings prioritized
- Secure storage with AsyncStorage

## 📈 Monetization

### Free Plan
- 5 scans per day
- Basic AI analysis
- Allergen alerts
- Scan history

### Premium Plan ($1.99/month)
- Unlimited scans
- Advanced AI analysis
- Priority support
- No ads
- Family profiles
- Meal planning

## 🚀 Publishing to App Stores

### iOS (App Store)
```bash
cd /app/frontend
eas build --platform ios
eas submit --platform ios
```

### Android (Play Store)
```bash
cd /app/frontend
eas build --platform android
eas submit --platform android
```

## 📱 Permissions Required

### iOS
- Camera Access
- Photo Library Access

### Android
- CAMERA
- READ_EXTERNAL_STORAGE

## 🐛 Troubleshooting

### Camera not working
- Ensure camera permissions are granted
- Check app.json for proper plugin configuration
- Try fallback manual entry

### AI analysis fails
- Verify EMERGENT_LLM_KEY is set
- Check backend logs for errors
- Ensure MongoDB is running

### PayPal payment issues
- Verify PayPal credentials in .env
- Check PayPal mode (sandbox/live)
- Review PayPal Developer Dashboard

## 🎯 Future Enhancements

- [ ] Product database integration (Open Food Facts API)
- [ ] Advanced OCR with Google Cloud Vision
- [ ] Nutritional facts analysis
- [ ] Shopping list integration
- [ ] Social sharing features
- [ ] Multiple language support
- [ ] Barcode history matching
- [ ] Healthier alternative suggestions

## 👥 Credits

Built with:
- OpenAI GPT-4o for AI analysis
- Expo for mobile development
- FastAPI for backend
- MongoDB for data storage
- PayPal for payments

## 📄 License

© 2024 Grocery Detective. All rights reserved.

## 🤝 Support

For support, email: support@grocerydetective.com

---

**Made with ❤️ for healthier food choices**
