import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padding?: keyof typeof Spacing;
}

export function Card({ elevated = false, padding = 'lg', children, style, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated ? styles.elevated : undefined,
        { padding: Spacing[padding] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    backgroundColor: Colors.bgElevated,
  },
});
