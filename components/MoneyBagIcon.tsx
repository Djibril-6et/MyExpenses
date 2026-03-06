import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import bourseImage from '../assets/bourse.png';

interface MoneyBagIconProps {
  size?: number;
  style?: any;
}

export default function MoneyBagIcon({ size = 350, style }: MoneyBagIconProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={bourseImage}
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
    transform: [{ rotate: '15deg' }],
  },
});
