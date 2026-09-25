import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/tokens';

interface AvatarCircleProps {
  initials: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const AvatarCircle: React.FC<AvatarCircleProps> = ({
  initials,
  size = 44,
  backgroundColor = COLORS.primary,
  textColor = COLORS.textInverse,
}) => {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: size * 0.38,
          },
        ]}
      >
        {initials.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
