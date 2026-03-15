import React, { useEffect } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';

// Module-level values so animation state persists across screen navigation.
// The loops start once and never stop – unmounting/remounting the component
// does not reset the orb positions.
const orb1 = new Animated.ValueXY({ x: 0, y: 0 });
const orb2 = new Animated.ValueXY({ x: 0, y: 0 });
const orb3 = new Animated.ValueXY({ x: 0, y: 0 });

function floatLoop(anim, toX, toY, duration) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(anim, {
        toValue: { x: toX, y: toY },
        duration,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.sin),
      }),
      Animated.timing(anim, {
        toValue: { x: -toX, y: -toY },
        duration,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.sin),
      }),
      Animated.timing(anim, {
        toValue: { x: 0, y: 0 },
        duration: Math.round(duration * 0.6),
        useNativeDriver: true,
        easing: Easing.inOut(Easing.sin),
      }),
    ])
  );
}

// Start animations immediately at module load – runs for the app's lifetime.
floatLoop(orb1, 14, 20, 8000).start();
floatLoop(orb2, -10, -16, 11000).start();
floatLoop(orb3, 8, -12, 9500).start();

/**
 * Reusable animated background orbs – add as the first child of any
 * screen's root View so it sits behind all other content.
 */
export default function AnimatedBackground() {
  // No-op effect kept as a hook anchor so React is happy.
  useEffect(() => {}, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[styles.orbOne, { transform: orb1.getTranslateTransform() }]}
      />
      <Animated.View
        style={[styles.orbTwo, { transform: orb2.getTranslateTransform() }]}
      />
      <Animated.View
        style={[styles.orbThree, { transform: orb3.getTranslateTransform() }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orbOne: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#CFE2F5',
    opacity: 0.55,
  },
  orbTwo: {
    position: 'absolute',
    bottom: 100,
    left: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#D8E8F7',
    opacity: 0.45,
  },
  orbThree: {
    position: 'absolute',
    top: '40%',
    right: '20%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C4D9F0',
    opacity: 0.22,
  },
});
