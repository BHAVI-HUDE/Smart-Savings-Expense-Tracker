import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#ff4d4d"];

function ExpenseChart({ data }) {
  const categoryData = {};
  

  data.forEach((t) => {
    if (t.type === "expense") {
      categoryData[t.category] =
        (categoryData[t.category] || 0) + t.amount;
    }
  });

  const chartData = Object.keys(categoryData).map((key) => ({
    name: key,
    value: categoryData[key],
  }));
  if (!data || data.length === 0) {
  return <p>No data available</p>;
}
if (chartData.length === 0) {
  return <p>No expense data to display</p>;
}

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        outerRadius={100}
      >
        {chartData.map((entry, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}

export default ExpenseChart;