#!/usr/bin/env python3
"""
Grocery Detective API Backend Testing
Tests all backend endpoints and functionality
"""

import requests
import json
import os
from datetime import datetime
import time

# Get backend URL from frontend env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing Grocery Detective API at: {API_URL}")

class GroceryDetectiveAPITest:
    def __init__(self):
        self.session = requests.Session()
        self.test_user_id = None
        self.test_results = {
            'health_check': False,
            'user_creation': False,
            'user_retrieval': False,
            'preferences_update': False,
            'ingredient_analysis_harmful': False,
            'ingredient_analysis_safe': False,
            'allergen_detection': False,
            'scan_limit_free': False,
            'scan_history': False,
            'payment_config': False,
            'premium_activation': False,
            'unlimited_scans_premium': False
        }
        self.errors = []

    def log_error(self, test_name, error):
        error_msg = f"❌ {test_name}: {str(error)}"
        self.errors.append(error_msg)
        print(error_msg)

    def log_success(self, test_name, message=""):
        success_msg = f"✅ {test_name}: {message}"
        print(success_msg)

    def test_health_check(self):
        """Test API health check endpoint"""
        try:
            response = self.session.get(f"{API_URL}")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    self.test_results['health_check'] = True
                    self.log_success("Health Check", f"API version: {data.get('version')}")
                    return True
                else:
                    self.log_error("Health Check", "Missing message or version in response")
            else:
                self.log_error("Health Check", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("Health Check", e)
        return False

    def test_create_user(self):
        """Test user creation with preferences"""
        try:
            user_data = {
                "email": "testuser@grocerydetective.com",
                "name": "Test User",
                "preferences": {
                    "dietary_restrictions": ["vegetarian"],
                    "allergens": ["peanuts", "shellfish"],
                    "health_goals": ["weight_loss", "heart_health"]
                }
            }
            
            response = self.session.post(f"{API_URL}/users", json=user_data)
            if response.status_code == 200:
                data = response.json()
                if "_id" in data and "email" in data:
                    self.test_user_id = data["_id"]
                    self.test_results['user_creation'] = True
                    self.log_success("User Creation", f"Created user with ID: {self.test_user_id}")
                    return True
                else:
                    self.log_error("User Creation", "Missing _id or email in response")
            else:
                self.log_error("User Creation", f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_error("User Creation", e)
        return False

    def test_get_user(self):
        """Test user retrieval"""
        if not self.test_user_id:
            self.log_error("User Retrieval", "No test user ID available")
            return False
            
        try:
            response = self.session.get(f"{API_URL}/users/{self.test_user_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("email") == "testuser@grocerydetective.com":
                    self.test_results['user_retrieval'] = True
                    self.log_success("User Retrieval", "Successfully retrieved user data")
                    return True
                else:
                    self.log_error("User Retrieval", "User data mismatch")
            else:
                self.log_error("User Retrieval", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("User Retrieval", e)
        return False

    def test_update_preferences(self):
        """Test updating user preferences"""
        if not self.test_user_id:
            self.log_error("Preferences Update", "No test user ID available")
            return False
            
        try:
            preferences_data = {
                "user_id": self.test_user_id,
                "dietary_restrictions": ["vegan", "gluten_free"],
                "allergens": ["peanuts", "tree nuts", "soy"],
                "health_goals": ["muscle_gain", "energy_boost"]
            }
            
            response = self.session.post(f"{API_URL}/users/preferences", json=preferences_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.test_results['preferences_update'] = True
                    self.log_success("Preferences Update", "Successfully updated preferences")
                    return True
                else:
                    self.log_error("Preferences Update", "Success flag not set")
            else:
                self.log_error("Preferences Update", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("Preferences Update", e)
        return False

    def test_analyze_harmful_ingredients(self):
        """Test ingredient analysis with harmful ingredients"""
        if not self.test_user_id:
            self.log_error("Harmful Ingredients Analysis", "No test user ID available")
            return False
            
        try:
            analysis_data = {
                "user_id": self.test_user_id,
                "ingredients_text": "High Fructose Corn Syrup, Sodium Benzoate, Red Dye 40, BHT, Aspartame"
            }
            
            response = self.session.post(f"{API_URL}/analyze-ingredients", json=analysis_data)
            if response.status_code == 200:
                data = response.json()
                if "overall_score" in data and "ingredients" in data:
                    # Check if harmful ingredients are detected with high harmful scores
                    harmful_detected = any(
                        ing.get("harmful_score", 0) > 50 
                        for ing in data.get("ingredients", [])
                    )
                    if harmful_detected and data.get("overall_score", 100) < 70:
                        self.test_results['ingredient_analysis_harmful'] = True
                        self.log_success("Harmful Ingredients Analysis", 
                                       f"Score: {data.get('overall_score')}, Recommendation: {data.get('recommendation')}")
                        return True
                    else:
                        self.log_error("Harmful Ingredients Analysis", 
                                     f"Expected low score and harmful detection, got score: {data.get('overall_score')}")
                else:
                    self.log_error("Harmful Ingredients Analysis", "Missing required fields in response")
            else:
                self.log_error("Harmful Ingredients Analysis", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("Harmful Ingredients Analysis", e)
        return False

    def test_analyze_safe_ingredients(self):
        """Test ingredient analysis with safe ingredients"""
        if not self.test_user_id:
            self.log_error("Safe Ingredients Analysis", "No test user ID available")
            return False
            
        try:
            analysis_data = {
                "user_id": self.test_user_id,
                "ingredients_text": "Water, Salt, Sugar, Natural Flavors, Citric Acid"
            }
            
            response = self.session.post(f"{API_URL}/analyze-ingredients", json=analysis_data)
            if response.status_code == 200:
                data = response.json()
                if "overall_score" in data and "ingredients" in data:
                    # Safe ingredients should have higher scores
                    if data.get("overall_score", 0) > 50:
                        self.test_results['ingredient_analysis_safe'] = True
                        self.log_success("Safe Ingredients Analysis", 
                                       f"Score: {data.get('overall_score')}, Recommendation: {data.get('recommendation')}")
                        return True
                    else:
                        self.log_error("Safe Ingredients Analysis", 
                                     f"Expected higher score for safe ingredients, got: {data.get('overall_score')}")
                else:
                    self.log_error("Safe Ingredients Analysis", "Missing required fields in response")
            else:
                self.log_error("Safe Ingredients Analysis", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("Safe Ingredients Analysis", e)
        return False

    def test_allergen_detection(self):
        """Test allergen detection based on user preferences"""
        if not self.test_user_id:
            self.log_error("Allergen Detection", "No test user ID available")
            return False
            
        try:
            # Test with peanuts (user has peanut allergy)
            analysis_data = {
                "user_id": self.test_user_id,
                "ingredients_text": "Wheat flour, Peanuts, Sugar, Salt, Natural flavors"
            }
            
            response = self.session.post(f"{API_URL}/analyze-ingredients", json=analysis_data)
            if response.status_code == 200:
                data = response.json()
                # Check if allergen warning is present
                allergen_detected = False
                for ingredient in data.get("ingredients", []):
                    if ingredient.get("is_allergen") or any("peanut" in warning.lower() for warning in ingredient.get("warnings", [])):
                        allergen_detected = True
                        break
                
                # Also check personalized advice for allergen warning
                advice = data.get("personalized_advice", "").lower()
                allergen_in_advice = "allergen" in advice or "avoid" in advice
                
                if allergen_detected or allergen_in_advice:
                    self.test_results['allergen_detection'] = True
                    self.log_success("Allergen Detection", "Successfully detected user allergens")
                    return True
                else:
                    self.log_error("Allergen Detection", "Failed to detect peanut allergen for user")
            else:
                self.log_error("Allergen Detection", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("Allergen Detection", e)
        return False

    def test_scan_limit_free_user(self):
        """Test scan limit for free users (5 scans per day)"""
        if not self.test_user_id:
            self.log_error("Scan Limit Test", "No test user ID available")
            return False
            
        try:
            analysis_data = {
                "user_id": self.test_user_id,
                "ingredients_text": "Water, Salt"
            }
            
            successful_scans = 0
            # Try to make 6 scans (should fail on 6th)
            for i in range(6):
                response = self.session.post(f"{API_URL}/analyze-ingredients", json=analysis_data)
                if response.status_code == 200:
                    successful_scans += 1
                elif response.status_code == 403:
                    # Expected to fail on 6th scan
                    if successful_scans == 5:
                        self.test_results['scan_limit_free'] = True
                        self.log_success("Scan Limit Test", f"Correctly limited to 5 scans, blocked on scan {i+1}")
                        return True
                    else:
                        self.log_error("Scan Limit Test", f"Unexpected limit at scan {i+1}, expected after 5")
                        return False
                else:
                    self.log_error("Scan Limit Test", f"Unexpected status code: {response.status_code}")
                    return False
            
            # If we get here, all 6 scans succeeded (should not happen)
            self.log_error("Scan Limit Test", "All 6 scans succeeded, limit not enforced")
            
        except Exception as e:
            self.log_error("Scan Limit Test", e)
        return False

    def test_scan_history(self):
        """Test retrieving scan history"""
        if not self.test_user_id:
            self.log_error("Scan History", "No test user ID available")
            return False
            
        try:
            response = self.session.get(f"{API_URL}/users/{self.test_user_id}/scans")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Should have some scans from previous tests
                    if len(data) > 0:
                        self.test_results['scan_history'] = True
                        self.log_success("Scan History", f"Retrieved {len(data)} scans")
                        return True
                    else:
                        self.log_success("Scan History", "No scans found (empty history)")
                        self.test_results['scan_history'] = True
                        return True
                else:
                    self.log_error("Scan History", "Response is not a list")
            else:
                self.log_error("Scan History", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("Scan History", e)
        return False

    def test_payment_config(self):
        """Test PayPal configuration endpoint"""
        try:
            response = self.session.get(f"{API_URL}/payment/config")
            if response.status_code == 200:
                data = response.json()
                if "client_id" in data and data.get("client_id"):
                    self.test_results['payment_config'] = True
                    self.log_success("Payment Config", f"PayPal client ID: {data.get('client_id')[:10]}...")
                    return True
                else:
                    self.log_error("Payment Config", "Missing or empty client_id")
            else:
                self.log_error("Payment Config", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("Payment Config", e)
        return False

    def test_premium_activation(self):
        """Test premium subscription activation"""
        if not self.test_user_id:
            self.log_error("Premium Activation", "No test user ID available")
            return False
            
        try:
            subscription_data = {
                "user_id": self.test_user_id,
                "payment_id": "test_payment_123",
                "plan_type": "monthly"
            }
            
            response = self.session.post(f"{API_URL}/payment/create-subscription", json=subscription_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.test_results['premium_activation'] = True
                    self.log_success("Premium Activation", "Successfully activated premium subscription")
                    return True
                else:
                    self.log_error("Premium Activation", "Success flag not set")
            else:
                self.log_error("Premium Activation", f"Status code: {response.status_code}")
        except Exception as e:
            self.log_error("Premium Activation", e)
        return False

    def test_unlimited_scans_premium(self):
        """Test unlimited scans for premium users"""
        if not self.test_user_id:
            self.log_error("Unlimited Scans Test", "No test user ID available")
            return False
            
        try:
            analysis_data = {
                "user_id": self.test_user_id,
                "ingredients_text": "Water, Salt"
            }
            
            # Try to make 10 scans (should all succeed for premium user)
            successful_scans = 0
            for i in range(10):
                response = self.session.post(f"{API_URL}/analyze-ingredients", json=analysis_data)
                if response.status_code == 200:
                    successful_scans += 1
                else:
                    self.log_error("Unlimited Scans Test", f"Scan {i+1} failed with status: {response.status_code}")
                    return False
            
            if successful_scans == 10:
                self.test_results['unlimited_scans_premium'] = True
                self.log_success("Unlimited Scans Test", "Premium user can make unlimited scans")
                return True
            else:
                self.log_error("Unlimited Scans Test", f"Only {successful_scans}/10 scans succeeded")
                
        except Exception as e:
            self.log_error("Unlimited Scans Test", e)
        return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("\n🧪 Starting Grocery Detective API Tests\n")
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Creation", self.test_create_user),
            ("User Retrieval", self.test_get_user),
            ("Preferences Update", self.test_update_preferences),
            ("Harmful Ingredients Analysis", self.test_analyze_harmful_ingredients),
            ("Safe Ingredients Analysis", self.test_analyze_safe_ingredients),
            ("Allergen Detection", self.test_allergen_detection),
            ("Scan Limit (Free User)", self.test_scan_limit_free_user),
            ("Scan History", self.test_scan_history),
            ("Payment Config", self.test_payment_config),
            ("Premium Activation", self.test_premium_activation),
            ("Unlimited Scans (Premium)", self.test_unlimited_scans_premium)
        ]
        
        for test_name, test_func in tests:
            print(f"\n--- Running {test_name} ---")
            test_func()
            time.sleep(0.5)  # Small delay between tests
        
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("🧪 GROCERY DETECTIVE API TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for result in self.test_results.values() if result)
        total = len(self.test_results)
        
        print(f"\n📊 Overall Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
        else:
            print(f"⚠️  {total - passed} tests failed")
        
        print("\n📋 Detailed Results:")
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {status} - {test_name.replace('_', ' ').title()}")
        
        if self.errors:
            print(f"\n🚨 Errors Encountered ({len(self.errors)}):")
            for error in self.errors:
                print(f"  {error}")
        
        print("\n" + "="*60)

if __name__ == "__main__":
    tester = GroceryDetectiveAPITest()
    tester.run_all_tests()