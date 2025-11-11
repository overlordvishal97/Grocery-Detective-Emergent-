import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const response = await axios.get(
          `${API_URL}/api/users/${userId}/scans?limit=50`
        );
        setScans(response.data);
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const viewScanDetails = (scan: any) => {
    router.push({
      pathname: '/results',
      params: {
        analysis: JSON.stringify(scan.analysis),
        ingredients: scan.ingredients_text,
      },
    });
  };

  const renderScanItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.scanCard}
      onPress={() => viewScanDetails(item)}
    >
      <View style={styles.scanHeader}>
        <View
          style={[
            styles.scoreCircle,
            { borderColor: getScoreColor(item.analysis.overall_score) },
          ]}
        >
          <Text
            style={[
              styles.scoreText,
              { color: getScoreColor(item.analysis.overall_score) },
            ]}
          >
            {item.analysis.overall_score}
          </Text>
        </View>
        <View style={styles.scanInfo}>
          <Text style={styles.scanDate}>{formatDate(item.created_at)}</Text>
          <View style={styles.recommendationRow}>
            <Ionicons
              name={getRecommendationIcon(item.analysis.recommendation)}
              size={16}
              color={getScoreColor(item.analysis.overall_score)}
            />
            <Text
              style={[
                styles.recommendationText,
                { color: getScoreColor(item.analysis.overall_score) },
              ]}
            >
              {item.analysis.recommendation === 'recommended'
                ? 'Recommended'
                : item.analysis.recommendation === 'neutral'
                ? 'Neutral'
                : 'Not Recommended'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>
      
      <Text style={styles.ingredientsPreview} numberOfLines={2}>
        {item.ingredients_text}
      </Text>
      
      {item.analysis.concerns && item.analysis.concerns.length > 0 && (
        <View style={styles.concernsBadge}>
          <Ionicons name="warning" size={16} color="#FF9800" />
          <Text style={styles.concernsText}>
            {item.analysis.concerns.length} concern{item.analysis.concerns.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading scan history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
        <View style={{ width: 28 }} />
      </View>

      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptySubtitle}>
            Start scanning products to see your history here
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/scanner')}
          >
            <Ionicons name="scan" size={24} color="#fff" />
            <Text style={styles.scanButtonText}>Scan Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderScanItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    gap: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  scanCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanInfo: {
    flex: 1,
  },
  scanDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsPreview: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
    marginBottom: 8,
  },
  concernsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  concernsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
});