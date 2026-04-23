import { formatCurrency } from "../utils/currency";

function CategoryInsights({ breakdown }) {
  const top = breakdown.slice(0, 5);

  if (!top.length) {
    return <p className="empty-state">No category insights available for selected month.</p>;
  }

  return (
    <div>
      <h3>Top categories (% share)</h3>
      <ul className="insights-list">
        {top.map((item) => (
          <li key={item.category}>
            <span>{item.category}</span>
            <span>
              {formatCurrency(item.total)} ({item.share}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryInsights;