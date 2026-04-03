import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryTooltip } from 'victory-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { VolumeDataPoint } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import dayjs from 'dayjs';

interface VolumeChartProps {
  data: VolumeDataPoint[];
  loading?: boolean;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.xl * 2;

export function VolumeChart({ data, loading }: VolumeChartProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  if (loading || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {loading ? 'Cargando...' : 'Sin datos para este período'}
        </Text>
      </View>
    );
  }

  const chartData = data.map((d) => ({
    x: dayjs(d.period).format('DD/MM'),
    y: unitSystem === 'imperial' ? d.total_volume_kg * 2.20462 : d.total_volume_kg,
    label: `${unitSystem === 'imperial' ? (d.total_volume_kg * 2.20462).toFixed(0) : d.total_volume_kg.toFixed(0)} ${unitSystem === 'imperial' ? 'lb' : 'kg'}`,
  }));

  return (
    <View style={styles.container}>
      <VictoryChart
        width={CHART_WIDTH}
        height={220}
        domainPadding={{ x: 12 }}
        padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
        theme={VictoryTheme.material}
      >
        <VictoryAxis
          style={{
            axis: { stroke: Colors.border },
            tickLabels: { fill: Colors.textSecondary, fontSize: 10 },
            grid: { stroke: 'transparent' },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: Colors.border },
            tickLabels: { fill: Colors.textSecondary, fontSize: 10 },
            grid: { stroke: Colors.border, strokeDasharray: '4,4' },
          }}
        />
        <VictoryBar
          data={chartData}
          style={{
            data: {
              fill: Colors.primary,
              fillOpacity: 0.9,
            },
          }}
          labelComponent={<VictoryTooltip flyoutStyle={{ fill: Colors.bgElevated }} style={{ fill: Colors.text, fontSize: 11 }} />}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    alignItems: 'center',
  },
  empty: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
