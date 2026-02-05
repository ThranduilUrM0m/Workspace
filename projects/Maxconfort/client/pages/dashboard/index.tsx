import React from "react";
import { motion } from "framer-motion";
import DashboardLayout from "./layout";

interface DashboardCard {
  id: number;
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const cards: DashboardCard[] = [
  { id: 1, title: "Total Users", value: 1234, icon: "👥", color: "from-blue-600 to-blue-400" },
  { id: 2, title: "Active Sessions", value: 42, icon: "🟢", color: "from-green-600 to-green-400" },
  { id: 3, title: "Revenue", value: "$12,345", icon: "💰", color: "from-purple-600 to-purple-400" },
  { id: 4, title: "Conversion Rate", value: "3.24%", icon: "📊", color: "from-orange-600 to-orange-400" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};


export default function Dashboard(): React.ReactElement {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Your Dashboard</h1>
          <p className="text-slate-400">Track your metrics and manage your workspace</p>
        </motion.div>

        {/* Dashboard Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cards.map((card) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              whileHover="hover"
              className={`bg-gradient-to-br ${card.color} rounded-lg p-6 text-white shadow-lg cursor-pointer transition`}
              style={{
                transformOrigin: "center",
              }}
              animate={{
                y: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-8px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 20px 40px rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "";
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-200 text-sm opacity-90">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Activity Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-slate-800 rounded-lg p-8 border border-slate-700 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                className="bg-slate-700 rounded-lg p-4 flex items-center justify-between hover:bg-slate-650 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  <div>
                    <p className="text-white font-medium">Activity {i}</p>
                    <p className="text-slate-400 text-sm">{i} hours ago</p>
                  </div>
                </div>
                <span className="text-slate-400">→</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
