'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

export type ChartProps = {
  data: any[];
  config: ChartConfig;
  className?: string;
  height?: number;
  type?: 'area' | 'bar' | 'line' | 'pie' | 'radar';
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisKey?: string;
};

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      data,
      config,
      className,
      height = 300,
      type = 'area',
      stacked = false,
      showGrid = true,
      showLegend = true,
      showTooltip = true,
      xAxisKey = 'name',
      ...props
    },
    ref
  ) => {
    const chartKeys = Object.keys(config);

    const renderChart = () => {
      const commonProps = {
        data,
        margin: { top: 10, right: 30, left: 0, bottom: 0 },
      };

      switch (type) {
        case 'area':
          return (
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {chartKeys.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId={stacked ? '1' : undefined}
                  stroke={config[key].color}
                  fill={config[key].color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name={config[key].label}
                />
              ))}
            </AreaChart>
          );

        case 'bar':
          return (
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {chartKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId={stacked ? '1' : undefined}
                  fill={config[key].color}
                  name={config[key].label}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          );

        case 'line':
          return (
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
              <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {chartKeys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config[key].color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={config[key].label}
                />
              ))}
            </LineChart>
          );

        case 'pie':
          return (
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={config[entry.name]?.color || `hsl(var(--primary))`} />
                ))}
              </Pie>
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
            </PieChart>
          );

        case 'radar':
          return (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" />
              <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
              {chartKeys.map((key) => (
                <Radar
                  key={key}
                  name={config[key].label}
                  dataKey={key}
                  stroke={config[key].color}
                  fill={config[key].color}
                  fillOpacity={0.3}
                />
              ))}
              {showLegend && <Legend />}
              {showTooltip && <Tooltip />
              }
            </RadarChart>
          );

        default:
          return <div className="flex items-center justify-center h-full text-muted-foreground">Select a chart type</div>;
      }
    };

    const chartElement = renderChart();

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <ResponsiveContainer width="100%" height={height}>
          {chartElement}
        </ResponsiveContainer>
      </div>
    );
  }
);
Chart.displayName = 'Chart';

export { Chart };