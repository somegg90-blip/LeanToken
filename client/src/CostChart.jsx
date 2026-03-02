import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function CostChart({ data }) {
  // Data for the Pie Chart
  const chartData = [
    { name: 'Wasted Spend', value: data.savings_found },
    { name: 'Necessary Spend', value: data.total_cost - data.savings_found },
  ];

  // Luxury Colors: Slate Gray & Emerald Green
  const COLORS = ['#18181b', '#10b981']; // Zinc 900 & Emerald 500

  return (
    <div className="w-full h-64 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value) => `$${value.toFixed(4)}`}
             contentStyle={{ 
               backgroundColor: '#18181b', 
               border: 'none', 
               borderRadius: '12px', 
               color: 'white',
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
             }} 
          />
          <Legend 
             verticalAlign="bottom" 
             height={36}
             formatter={(value, entry) => (
                <span style={{ color: entry.payload.fill, fontWeight: 500, fontSize: '0.875rem' }}>
                  {value}
                </span>
             )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}