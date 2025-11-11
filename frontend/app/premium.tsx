import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PremiumScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paypalConfig, setPaypalConfig] = useState<any>(null);

  useEffect(() => {
    loadPaypalConfig();
  }, []);

  const loadPaypalConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/payment/config`);
      setPaypalConfig(response.data);
    } catch (error) {
      console.error('Error loading PayPal config:', error);
    }
  };

  const handleUpgrade = async () => {
    Alert.alert(
      'Upgrade to Premium',
      'PayPal payment integration is ready! In production, this would open PayPal checkout.\n\nFor demo purposes, would you like to activate premium access?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Activate Demo Premium',
          onPress: activateDemoPremium,
        },
      ]
    );
  };

  const activateDemoPremium = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      await axios.post(`${API_URL}/api/payment/create-subscription`, {
        user_id: userId,
        payment_id: 'demo_payment_' + Date.now(),
        plan_type: 'monthly',
      });

      Alert.alert(
        'Success!',
        'Premium access activated! You now have unlimited scans.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch (error) {
      console.error('Error activating premium:', error);
      Alert.alert('Error', 'Failed to activate premium access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Go Premium</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.starContainer}>
            <Ionicons name="star" size={64} color="#FFD700" />
          </View>
          <Text style={styles.heroTitle}>Unlock Full Access</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited scans and advanced features
          </Text>
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>$1.99</Text>
            <Text style={styles.priceSubtext}>/month</Text>
          </View>
          <Text style={styles.pricingDescription}>
            Cancel anytime. No commitment.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Premium Benefits</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="infinite" size={28} color="#4CAF50" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Unlimited Scans</Text>
              <Text style={styles.featureDescription}>
                Scan as many products as you want, every day
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="sparkles" size={28} color="#9C27B0" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Advanced AI Analysis</Text>
              <Text style={styles.featureDescription}>
                Get deeper insights powered by GPT-4o
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="fitness" size={28} color="#F44336" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Health Analytics</Text>
              <Text style={styles.featureDescription}>
                Track your dietary patterns over time
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="people" size={28} color="#2196F3" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Family Profiles</Text>
              <Text style={styles.featureDescription}>
                Create profiles for family members
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="restaurant" size={28} color="#FF9800" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Meal Planning</Text>
              <Text style={styles.featureDescription}>
                Get personalized meal recommendations
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="close-circle" size={28} color="#607D8B" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Ad-Free Experience</Text>
              <Text style={styles.featureDescription}>
                Enjoy the app without any interruptions
              </Text>
            </View>
          </View>
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleUpgrade}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={24} color="#fff" />
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Free Features */}
        <View style={styles.freeSection}>
          <Text style={styles.freeSectionTitle}>Free Plan Includes:</Text>
          <View style={styles.freeItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.freeItemText}>5 scans per day</Text>
          </View>
          <View style={styles.freeItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.freeItemText}>Basic ingredient analysis</Text>
          </View>
          <View style={styles.freeItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.freeItemText}>Allergen alerts</Text>
          </View>
        </View>

        {/* PayPal Info */}
        <View style={styles.paymentInfo}>
          <Ionicons name="lock-closed" size={20} color="#666" />
          <Text style={styles.paymentInfoText}>
            Secure payment powered by PayPal
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroSection: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  starContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceSubtext: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#999',
  },
  featuresSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  freeSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  freeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  freeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  freeItemText: {
    fontSize: 14,
    color: '#666',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
    gap: 8,
  },
  paymentInfoText: {
    fontSize: 12,
    color: '#666',
  },
});