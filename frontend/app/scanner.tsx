import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanMode, setScanMode] = useState<'barcode' | 'ingredients'>('barcode');
  const [scanned, setScanned] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    
    Alert.alert(
      'Barcode Scanned',
      `Barcode: ${data}\n\nNote: Barcode database integration coming soon. For now, please scan the ingredient label directly or enter ingredients manually.`,
      [
        {
          text: 'Scan Ingredients',
          onPress: () => {
            setScanMode('ingredients');
            setScanned(false);
          },
        },
        {
          text: 'Manual Entry',
          onPress: () => setManualMode(true),
        },
      ]
    );
  };

  const captureIngredientPhoto = async () => {
    setScanned(true);
    Alert.alert(
      'Photo Captured',
      'OCR processing would happen here. For MVP, please enter ingredients manually.',
      [
        {
          text: 'Manual Entry',
          onPress: () => setManualMode(true),
        },
        {
          text: 'Try Again',
          onPress: () => setScanned(false),
        },
      ]
    );
  };

  const analyzeIngredients = async (ingredientsText: string) => {
    if (!ingredientsText.trim()) {
      Alert.alert('Error', 'Please enter ingredients');
      return;
    }

    setAnalyzing(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await axios.post(`${API_URL}/api/analyze-ingredients`, {
        user_id: userId,
        ingredients_text: ingredientsText,
      });

      // Navigate to results with the analysis
      router.push({
        pathname: '/results',
        params: {
          analysis: JSON.stringify(response.data),
          ingredients: ingredientsText,
        },
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to analyze ingredients'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off" size={64} color="#999" />
          <Text style={styles.permissionText}>Camera permission not granted</Text>
          <Text style={styles.permissionSubtext}>
            Please enable camera access in your device settings
          </Text>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => setManualMode(true)}
          >
            <Text style={styles.manualButtonText}>Enter Manually Instead</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (manualMode) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.manualContainer}
        >
          {/* Header */}
          <View style={styles.manualHeader}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={styles.manualTitle}>Enter Ingredients</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.instructionsText}>
              Enter the ingredients list from the product label, separated by commas
            </Text>
          </View>

          {/* Input */}
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Water, Sugar, Salt, Citric Acid, Natural Flavors..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={8}
            value={manualText}
            onChangeText={setManualText}
            textAlignVertical="top"
          />

          {/* Analyze Button */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!manualText.trim() || analyzing) && styles.analyzeButtonDisabled,
            ]}
            onPress={() => analyzeIngredients(manualText)}
            disabled={!manualText.trim() || analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="flask" size={24} color="#fff" />
                <Text style={styles.analyzeButtonText}>Analyze Ingredients</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back to Camera */}
          <TouchableOpacity
            style={styles.backToCameraButton}
            onPress={() => {
              setManualMode(false);
              setScanned(false);
            }}
          >
            <Ionicons name="camera" size={20} color="#4CAF50" />
            <Text style={styles.backToCameraText}>Use Camera Instead</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanMode === 'barcode' && !scanned ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'code128',
            'code39',
            'qr',
          ],
        }}
      >
        {/* Header */}
        <SafeAreaView style={styles.cameraHeader}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {scanMode === 'barcode' ? 'Scan Barcode' : 'Scan Ingredients'}
            </Text>
            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={() => setManualMode(true)}
            >
              <Ionicons name="create" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Scan Frame */}
        <View style={styles.scanFrame}>
          <View style={styles.frameCorner} />
          <View style={[styles.frameCorner, styles.frameCornerTopRight]} />
          <View style={[styles.frameCorner, styles.frameCornerBottomLeft]} />
          <View style={[styles.frameCorner, styles.frameCornerBottomRight]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {scanMode === 'barcode'
              ? 'Position barcode within the frame'
              : 'Position ingredient label within the frame'}
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                scanMode === 'barcode' && styles.modeButtonActive,
              ]}
              onPress={() => {
                setScanMode('barcode');
                setScanned(false);
              }}
            >
              <Ionicons
                name="barcode"
                size={24}
                color={scanMode === 'barcode' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  scanMode === 'barcode' && styles.modeButtonTextActive,
                ]}
              >
                Barcode
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modeButton,
                scanMode === 'ingredients' && styles.modeButtonActive,
              ]}
              onPress={() => {
                setScanMode('ingredients');
                setScanned(false);
              }}
            >
              <Ionicons
                name="list"
                size={24}
                color={scanMode === 'ingredients' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  scanMode === 'ingredients' && styles.modeButtonTextActive,
                ]}
              >
                Ingredients
              </Text>
            </TouchableOpacity>
          </View>

          {/* Capture Button for Ingredients Mode */}
          {scanMode === 'ingredients' && (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureIngredientPhoto}
              disabled={scanned}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  manualEntryButton: {
    padding: 8,
  },
  scanFrame: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    width: '80%',
    height: 200,
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4CAF50',
    top: 0,
    left: 0,
  },
  frameCornerTopRight: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  frameCornerBottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 4,
  },
  frameCornerBottomRight: {
    top: undefined,
    left: undefined,
    right: 0,
    bottom: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F7FA',
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 24,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  manualButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  manualContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  manualTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
  },
  textInput: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  analyzeButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  backToCameraText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
});