import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useUniqueFoods } from '../../hooks/useUniqueFoods';

interface PalateRadarProps {
  babyId: string;
  size?: 'small' | 'medium' | 'large';
}

const CATEGORY_DISPLAY: Record<string, { label: string; fullMark: number }> = {
  fruit: { label: 'Fruits', fullMark: 15 },
  vegetable: { label: 'Veggies', fullMark: 15 },
  protein: { label: 'Protein', fullMark: 10 },
  grain: { label: 'Grains', fullMark: 10 },
  dairy: { label: 'Dairy', fullMark: 8 },
  legume: { label: 'Legumes', fullMark: 5 },
};

export function PalateRadar({ babyId, size = 'medium' }: PalateRadarProps) {
  const { categoryBreakdown } = useUniqueFoods(babyId);

  // Transform data for recharts
  const chartData = categoryBreakdown
    .filter((c) => c.category !== 'other') // Exclude "other" from radar
    .map((category) => ({
      category: CATEGORY_DISPLAY[category.category]?.label || category.label,
      count: category.count,
      fullMark: CATEGORY_DISPLAY[category.category]?.fullMark || 10,
    }));

  const sizes = {
    small: { width: 200, height: 200 },
    medium: { width: 280, height: 280 },
    large: { width: 350, height: 350 },
  };

  const { width, height } = sizes[size];

  // Check if there's any data
  const hasData = chartData.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div
        className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center"
        style={{ minHeight: height }}
      >
        <span className="text-4xl mb-2">🎨</span>
        <p className="text-gray-500 text-center">
          Start logging foods to see your palate radar!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-charcoal text-center mb-2">
        Palate Radar
      </h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        Food variety by category
      </p>

      <div className="flex justify-center">
        <ResponsiveContainer width={width} height={height}>
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid
              stroke="#e5e7eb"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 'dataMax']}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickCount={4}
            />
            <Radar
              name="Foods tried"
              dataKey="count"
              stroke="#7BC796"
              fill="#98D8AA"
              fillOpacity={0.5}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#7BC796',
                strokeWidth: 2,
                stroke: '#fff',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {categoryBreakdown
          .filter((c) => c.category !== 'other' && c.count > 0)
          .map((category) => (
            <div key={category.category} className="flex items-center gap-1">
              <span className="text-sm">{category.emoji}</span>
              <span className="text-xs text-gray-600">
                {category.count} {category.label.toLowerCase()}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
