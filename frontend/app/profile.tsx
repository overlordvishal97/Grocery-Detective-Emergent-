import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const COMMON_ALLERGENS = [
  'Milk',
  'Eggs',
  'Peanuts',
  'Tree Nuts',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish',
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher',
];

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await axios.get(`${API_URL}/api/users/${userId}`);
        setUser(response.data);
        setSelectedAllergens(response.data.preferences?.allergens || []);
        setSelectedDietary(response.data.preferences?.dietary_restrictions || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const toggleDietary = (dietary: string) => {
    setSelectedDietary((prev) =>
      prev.includes(dietary)
        ? prev.filter((d) => d !== dietary)
        : [...prev, dietary]
    );
  };

  const addCustomAllergen = () => {
    if (customAllergen.trim() && !selectedAllergens.includes(customAllergen.trim())) {
      setSelectedAllergens([...selectedAllergens, customAllergen.trim()]);
      setCustomAllergen('');
    }
  };

  const removeCustomAllergen = (allergen: string) => {
    if (!COMMON_ALLERGENS.includes(allergen)) {
      setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen));
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      await axios.post(`${API_URL}/api/users/preferences`, {
        user_id: userId,
        allergens: selectedAllergens,
        dietary_restrictions: selectedDietary,
        health_goals: [],
      });
      
      Alert.alert('Success', 'Preferences saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Preferences</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.is_premium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.premiumBadgeText}>Premium Member</Text>
            </View>
          )}
        </View>

        {/* Dietary Restrictions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="nutrition" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          </View>
          <View style={styles.optionsGrid}>
            {DIETARY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  selectedDietary.includes(option) && styles.optionChipSelected,
                ]}
                onPress={() => toggleDietary(option)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedDietary.includes(option) &&
                      styles.optionChipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergens */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={24} color="#FF9800" />
            <Text style={styles.sectionTitle}>Allergens to Avoid</Text>
          </View>
          <View style={styles.optionsGrid}>
            {COMMON_ALLERGENS.map((allergen) => (
              <TouchableOpacity
                key={allergen}
                style={[
                  styles.optionChip,
                  selectedAllergens.includes(allergen) &&
                    styles.optionChipSelectedRed,
                ]}
                onPress={() => toggleAllergen(allergen)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedAllergens.includes(allergen) &&
                      styles.optionChipTextSelected,
                  ]}
                >
                  {allergen}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Allergens */}
          {selectedAllergens.filter((a) => !COMMON_ALLERGENS.includes(a))
            .length > 0 && (
            <View style={styles.customAllergensContainer}>
              <Text style={styles.customAllergensTitle}>Custom Allergens:</Text>
              <View style={styles.customAllergensGrid}>
                {selectedAllergens
                  .filter((a) => !COMMON_ALLERGENS.includes(a))
                  .map((allergen) => (
                    <View key={allergen} style={styles.customAllergenChip}>
                      <Text style={styles.customAllergenText}>{allergen}</Text>
                      <TouchableOpacity
                        onPress={() => removeCustomAllergen(allergen)}
                      >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Add Custom Allergen */}
          <View style={styles.addCustomContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Add custom allergen..."
              placeholderTextColor="#999"
              value={customAllergen}
              onChangeText={setCustomAllergen}
              onSubmitEditing={addCustomAllergen}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCustomAllergen}
            >
              <Ionicons name="add-circle" size={32} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Section */}
        {!user?.is_premium && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => router.push('/premium')}
          >
            <Ionicons name="star" size={32} color="#FFD700" />
            <View style={styles.premiumCardContent}>
              <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumCardSubtitle}>
                Unlimited scans, advanced AI analysis, and more!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </>
          )}
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionChipSelectedRed: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionChipTextSelected: {
    color: '#fff',
  },
  customAllergensContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  customAllergensTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  customAllergensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customAllergenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  customAllergenText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  addCustomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButton: {
    padding: 4,
  },
  premiumCard: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  premiumCardContent: {
    flex: 1,
  },
  premiumCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  premiumCardSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});