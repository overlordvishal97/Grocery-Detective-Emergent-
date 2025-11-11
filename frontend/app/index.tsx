import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scansRemaining, setScansRemaining] = useState(5);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      let userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        // Create new user
        const response = await axios.post(`${API_URL}/api/users`, {
          email: 'demo@grocerydetective.com',
          name: 'Demo User',
          preferences: {
            dietary_restrictions: [],
            allergens: [],
            health_goals: [],
          },
          is_premium: false,
        });
        
        userId = response.data._id;
        await AsyncStorage.setItem('userId', userId);
        setUser(response.data);
      } else {
        // Fetch existing user
        const response = await axios.get(`${API_URL}/api/users/${userId}`);
        setUser(response.data);
      }
      
      // Calculate scans remaining
      const userData = user || response.data;
      const remaining = userData.is_premium ? Infinity : Math.max(0, 5 - (userData.scans_today || 0));
      setScansRemaining(remaining);
    } catch (error) {
      console.error('Error initializing user:', error);
      Alert.alert('Error', 'Failed to initialize user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name}!</Text>
              <Text style={styles.subtitle}>What would you like to scan today?</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="person-circle-outline" size={40} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          {/* Premium Badge */}
          {!user?.is_premium && (
            <TouchableOpacity
              style={styles.premiumBanner}
              onPress={() => router.push('/premium')}
            >
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.premiumText}>
                Upgrade to Premium for unlimited scans!
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Scan Limit Info */}
        {!user?.is_premium && (
          <View style={styles.scanLimitCard}>
            <Ionicons name="timer-outline" size={28} color="#FF9800" />
            <View style={styles.scanLimitText}>
              <Text style={styles.scanLimitTitle}>Daily Scans</Text>
              <Text style={styles.scanLimitSubtitle}>
                {scansRemaining} of 5 remaining
              </Text>
            </View>
          </View>
        )}

        {/* Main Scan Button */}
        <TouchableOpacity
          style={styles.mainScanButton}
          onPress={() => router.push('/scanner')}
        >
          <View style={styles.scanIconContainer}>
            <Ionicons name="scan" size={64} color="#fff" />
          </View>
          <Text style={styles.mainScanText}>Scan Product</Text>
          <Text style={styles.mainScanSubtext}>Barcode or Ingredient Label</Text>
        </TouchableOpacity>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push('/history')}
          >
            <Ionicons name="time-outline" size={32} color="#2196F3" />
            <Text style={styles.featureTitle}>History</Text>
            <Text style={styles.featureSubtitle}>View past scans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="settings-outline" size={32} color="#9C27B0" />
            <Text style={styles.featureTitle}>Preferences</Text>
            <Text style={styles.featureSubtitle}>Dietary & allergens</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Scan product barcode or ingredient label</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>AI analyzes ingredients for health concerns</Text>
          </View>
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Get personalized recommendations</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  premiumText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  scanLimitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    margin: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  scanLimitText: {
    marginLeft: 16,
    flex: 1,
  },
  scanLimitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
  },
  scanLimitSubtitle: {
    fontSize: 14,
    color: '#F57C00',
    marginTop: 4,
  },
  mainScanButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanIconContainer: {
    marginBottom: 16,
  },
  mainScanText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  mainScanSubtext: {
    fontSize: 14,
    color: '#E8F5E9',
  },
  featuresGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
});