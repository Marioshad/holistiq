import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { shadows } from '../styles/styleGuide';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onboardingData: OnboardingStep[] = [
    {
      id: '1',
      title: 'Welcome',
      subtitle: 'to HealthyR',
      description: 'Your personal wellness companion that helps you build healthy habits and track your journey to a better you.',
      icon: 'celebration',
      color: '#cccccc',
      backgroundColor: '#cccccc',
    },
    {
      id: '2',
      title: 'Track Your Life',
      subtitle: 'effortlessly',
      description: 'Monitor your nutrition, supplements, exercise, and mindfulness activities all in one place with beautiful, intuitive tools.',
      icon: 'show-chart',
      color: '#059669',
      backgroundColor: '#ECFDF5',
    },
    {
      id: '3',
      title: 'Custom Plans',
      subtitle: 'just for you',
      description: 'Create personalized wellness routines that fit your lifestyle and goals. Your health, your way.',
      icon: 'star',
      color: '#7C3AED',
      backgroundColor: '#FAF5FF',
    },
  ];

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const renderDot = (index: number) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1.4, 0.8],
      extrapolate: 'clamp',
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            backgroundColor: onboardingData[index]?.color || '#2563EB',
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  const renderItem = ({ item }: { item: OnboardingStep }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.slideContent}>
        {/* Icon Section */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
            <MaterialIcons name={item.icon as any} size={64} color="#FFFFFF" />
          </View>
        </View>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FD" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Onboarding Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => renderDot(index))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {currentIndex === onboardingData.length - 1 ? (
            <TouchableOpacity
              style={[styles.getStartedButton, { backgroundColor: onboardingData[currentIndex].color }]}
              onPress={handleNext}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={[styles.nextButtonText, { color: onboardingData[currentIndex].color }]}>
                  Next
                </Text>
                <MaterialIcons 
                  name="arrow-forward" 
                  size={20} 
                  color={onboardingData[currentIndex].color} 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FD',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  skipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
    paddingBottom: 180,
  },
  iconContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl, // Use style guide shadow instead of custom platform logic
  },
  textContainer: {
    flex: 0.6,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingTop: 32,
    paddingBottom: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    ...shadows.lg, // Use style guide shadow instead of custom platform logic
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    ...shadows.md, // Use style guide shadow instead of custom platform logic
    gap: 8,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen; 