export interface AnimatedProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  tooltip?: string;
  className?: string;
}

export interface AnimatedProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  tooltip?: string;
  className?: string;
}

export interface MorphingNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  animateOnChange?: boolean;
}

export interface StatCardProps {
  title: string;
  value: number;
  maxValue?: number;
  previousValue?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  format?: (value: number) => string;
  showProgress?: boolean;
  progressType?: 'bar' | 'ring';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  tooltip?: string;
  className?: string;
}