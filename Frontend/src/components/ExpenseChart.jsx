import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "../utils/currency";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#ff4d4d", "#8e44ad"];

function ExpenseChart({ breakdown }) {
  const chartData = breakdown.slice(0, 6).map((item) => ({
    name: item.category,
    value: item.total,
    share: item.share,
  }));

  if (!chartData.length) {
    return <p className="empty-state">No expense data to display for this month.</p>;
  }

  return (
     <PieChart width={420} height={300}>
      <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100}>

        {chartData.map((entry, index) => (
          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => formatCurrency(value)} />
      <Legend formatter={(value, entry) => `${value} (${entry.payload.share}%)`} />
    </PieChart>
  );
}

export default ExpenseChart;