import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const analysis = JSON.parse(params.analysis as string);
  const ingredients = params.ingredients as string;

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  };

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation === 'recommended') return 'checkmark-circle';
    if (recommendation === 'neutral') return 'alert-circle';
    return 'close-circle';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation === 'recommended') return '#4CAF50';
    if (recommendation === 'neutral') return '#FF9800';
    return '#F44336';
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
            <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Results</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Ionicons name="home" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        {/* Overall Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text
              style={[
                styles.scoreText,
                { color: getScoreColor(analysis.overall_score) },
              ]}
            >
              {analysis.overall_score}
            </Text>
            <Text style={styles.scoreLabel}>Health Score</Text>
          </View>
          <View style={styles.recommendationBadge}>
            <Ionicons
              name={getRecommendationIcon(analysis.recommendation)}
              size={32}
              color={getRecommendationColor(analysis.recommendation)}
            />
            <Text
              style={[
                styles.recommendationText,
                { color: getRecommendationColor(analysis.recommendation) },
              ]}
            >
              {analysis.recommendation === 'recommended'
                ? 'Recommended'
                : analysis.recommendation === 'neutral'
                ? 'Use Caution'
                : 'Not Recommended'}
            </Text>
          </View>
        </View>

        {/* Personalized Advice */}
        {analysis.personalized_advice && (
          <View style={styles.adviceCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={24} color="#2196F3" />
              <Text style={styles.cardTitle}>Personalized Advice</Text>
            </View>
            <Text style={styles.adviceText}>{analysis.personalized_advice}</Text>
          </View>
        )}

        {/* Health Benefits */}
        {analysis.health_benefits && analysis.health_benefits.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart" size={24} color="#4CAF50" />
              <Text style={styles.cardTitle}>Health Benefits</Text>
            </View>
            {analysis.health_benefits.map((benefit: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.listItemText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Concerns */}
        {analysis.concerns && analysis.concerns.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={24} color="#FF9800" />
              <Text style={styles.cardTitle}>Concerns</Text>
            </View>
            {analysis.concerns.map((concern: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="alert-circle" size={20} color="#FF9800" />
                <Text style={styles.listItemText}>{concern}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Ingredient Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={24} color="#9C27B0" />
            <Text style={styles.cardTitle}>Ingredient Analysis</Text>
          </View>
          {analysis.ingredients.map((ingredient: any, index: number) => (
            <View key={index} style={styles.ingredientCard}>
              <View style={styles.ingredientHeader}>
                <Text style={styles.ingredientName}>{ingredient.ingredient}</Text>
                {ingredient.is_allergen && (
                  <View style={styles.allergenBadge}>
                    <Ionicons name="warning" size={16} color="#fff" />
                    <Text style={styles.allergenText}>ALLERGEN</Text>
                  </View>
                )}
              </View>
              
              {/* Harmful Score Bar */}
              <View style={styles.scoreBar}>
                <View style={styles.scoreBarBackground}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      {
                        width: `${ingredient.harmful_score}%`,
                        backgroundColor: getScoreColor(100 - ingredient.harmful_score),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.scoreBarText}>
                  {ingredient.harmful_score > 0
                    ? `Concern: ${ingredient.harmful_score}/100`
                    : 'Safe'}
                </Text>
              </View>

              {/* Health Impact */}
              <Text style={styles.healthImpact}>{ingredient.health_impact}</Text>

              {/* Warnings */}
              {ingredient.warnings && ingredient.warnings.length > 0 && (
                <View style={styles.warningsContainer}>
                  {ingredient.warnings.map((warning: string, idx: number) => (
                    <View key={idx} style={styles.warningItem}>
                      <Ionicons name="alert" size={16} color="#F44336" />
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/scanner')}
          >
            <Ionicons name="scan" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Scan Another</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
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
  homeButton: {
    padding: 4,
  },
  scoreCard: {
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
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  recommendationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  adviceCard: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  adviceText: {
    fontSize: 15,
    color: '#1565C0',
    lineHeight: 22,
  },
  sectionCard: {
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ingredientCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  allergenBadge: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  allergenText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreBar: {
    marginBottom: 12,
  },
  scoreBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreBarText: {
    fontSize: 12,
    color: '#666',
  },
  healthImpact: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  warningsContainer: {
    marginTop: 8,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#F44336',
    lineHeight: 18,
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});