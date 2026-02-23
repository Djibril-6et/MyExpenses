import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';

interface ShoppingCartIconProps {
  size?: number;
  style?: any;
}

export default function ShoppingCartIcon({ size = 300, style }: ShoppingCartIconProps) {
  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <G transform="rotate(-15, 100, 100)">
          <Path
            d="M35 60 L165 60 L155 145 L45 145 Z"
            fill="none"
            stroke="#2872A1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M35 60 L20 35"
            stroke="#2872A1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="55" cy="145" r="10" fill="#2872A1" />
          <Circle cx="145" cy="145" r="10" fill="#2872A1" />
          <Path
            d="M20 35 L175 35 L185 20"
            stroke="#2872A1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="185" cy="20" r="6" fill="#2872A1" />
          <Path
            d="M55 145 L55 75 L145 75 L145 145"
            stroke="#2872A1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0.12,
  },
});