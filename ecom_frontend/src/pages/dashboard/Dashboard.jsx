import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Eye,
} from "lucide-react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    title: "Total Revenue",
    value: "$24,500",
    icon: DollarSign,
    change: "+12.5%",
    trend: "up",
    today: "$1,200 today",
    chart: [10, 30, 20, 50, 40, 60],
  },
  {
    title: "Orders",
    value: "1,240",
    icon: ShoppingCart,
    change: "+8.2%",
    trend: "up",
    today: "120 today",
    chart: [20, 25, 35, 30, 45, 50],
  },
  {
    title: "Customers",
    value: "845",
    icon: Users,
    change: "-2.4%",
    trend: "down",
    today: "15 new",
    chart: [50, 45, 40, 35, 30, 25],
  },
  {
    title: "Products",
    value: "320",
    icon: Package,
    change: "+5.1%",
    trend: "up",
    today: "10 added",
    chart: [10, 20, 30, 40, 50, 60],
  },
];

const revenueData = [
  { name: "Mon", revenue: 400 },
  { name: "Tue", revenue: 300 },
  { name: "Wed", revenue: 500 },
  { name: "Thu", revenue: 700 },
  { name: "Fri", revenue: 600 },
  { name: "Sat", revenue: 900 },
  { name: "Sun", revenue: 800 },
];

const topProducts = [
  { name: "iPhone 15", sales: 120, stock: "In Stock" },
  { name: "Nike Shoes", sales: 90, stock: "Low Stock" },
  { name: "MacBook Pro", sales: 70, stock: "In Stock" },
  { name: "Samsung TV", sales: 50, stock: "Out of Stock" },
];

const recentOrders = [
  { id: "#ORD001", customer: "John Doe", amount: "$120", status: "Paid" },
  { id: "#ORD002", customer: "Jane Smith", amount: "$340", status: "Pending" },
  { id: "#ORD003", customer: "Alex", amount: "$89", status: "Paid" },
  { id: "#ORD004", customer: "Michael", amount: "$560", status: "Failed" },
];

export default function EcommerceDashboard() {
  return (
    <div className="min-h-screen mt-2 text-foreground">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Ecommerce Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item, i) => {
          const Icon = item.icon;

          const chartData = item.chart.map((v, i) => ({
            name: i,
            value: v,
          }));

          return (
            <div
              key={i}
              className="relative p-5 transition-all duration-300 border shadow-sm bg-card border-border rounded-2xl hover:shadow-lg hover:-translate-y-1 text-card-foreground"
            >
              {/* TOP ROW */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.title}</p>

                  <h2 className="mt-1 text-xl font-bold text-card-foreground">
                    {item.value}
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.today}
                  </p>
                </div>

                {/* ICON BOX */}
                <div className="p-3 shadow-md rounded-xl bg-gradient-to-r from-primary to-secondary">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>

              {/* MINI CHART */}
              <div className="mt-4 h-[70px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={item.trend === "up" ? "#16a34a" : "#dc2626"}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* BOTTOM */}
              <div className="flex items-center justify-between mt-3 text-xs">
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    item.trend === "up"
                      ? "text-destructive"
                      : "text-destructive"
                  }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {item.change}
                </span>

                <span className="text-muted-foreground">This week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MIDDLE SECTION */}
      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        {/* REVENUE CHART */}
        <div className="p-5 border shadow-sm bg-card rounded-2xl border-border">
          <h2 className="flex items-center gap-2 mb-4 font-semibold text-foreground">
            <CreditCard size={18} /> Revenue Overview
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="#93c5fd"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* TOP PRODUCTS */}
        <div className="p-5 border shadow-sm bg-card rounded-2xl border-border">
          <h2 className="flex items-center gap-2 mb-4 font-semibold text-foreground">
            <Package size={18} /> Top Products
          </h2>

          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.stock}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {p.sales} sales
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="p-5 mt-8 border shadow-sm bg-card rounded-2xl border-border">
        <h2 className="flex items-center gap-2 mb-4 font-semibold text-foreground">
          <Eye size={18} /> Recent Orders
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 text-muted-foreground">Order ID</th>
                <th className="py-2 text-muted-foreground">Customer</th>
                <th className="py-2 text-muted-foreground">Amount</th>
                <th className="py-2 text-muted-foreground">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((o, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="py-2 text-foreground">{o.id}</td>
                  <td className="py-2 text-foreground">{o.customer}</td>
                  <td className="py-2 text-foreground">{o.amount}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        o.status === "Paid"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : o.status === "Pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                            : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
