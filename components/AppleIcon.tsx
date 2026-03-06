import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import pommeImage from '../assets/pomme.png';

interface AppleIconProps {
  size?: number;
  style?: any;
}

export default function AppleIcon({ size = 300, style }: AppleIconProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={pommeImage}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0.12,
  },
  image: {
    transform: [{ rotate: '-15deg' }],
  },
});
