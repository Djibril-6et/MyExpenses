import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';

interface WalletIconProps {
  size?: number;
  style?: any;
}

export default function WalletIcon({ size = 350, style }: WalletIconProps) {
  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <G transform="rotate(15, 100, 100)">
          <Path
            d="M50 60 L150 60 L145 140 L55 140 Z"
            fill="none"
            stroke="#2872A1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M50 60 L35 45"
            stroke="#2872A1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="60" cy="140" r="10" fill="#2872A1" />
          <Circle cx="140" cy="140" r="10" fill="#2872A1" />
          <Path
            d="M35 45 L165 45 L175 30"
            stroke="#2872A1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="175" cy="30" r="6" fill="#2872A1" />
          
          <Path
            d="M100 60 L100 140"
            stroke="#2872A1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M75 75 Q100 85 125 75"
            stroke="#2872A1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <Path
            d="M75 95 Q100 105 125 95"
            stroke="#2872A1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
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