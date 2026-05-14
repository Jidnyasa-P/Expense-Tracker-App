/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import * as React from 'react';
import { 
  Plus, 
  Trash2, 
  BarChart3, 
  PieChart as PieChartIcon, 
  BrainCircuit, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Calendar,
  Filter,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { Transaction, TransactionCategory, SpendingInsight } from './types';
import { generateSyntheticData } from './utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#475569'];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Stats calculations
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'Income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // Chart data: Category distribution
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Chart data: Daily trends (last 30 days)
  const trendData = useMemo(() => {
    const data: Record<string, { date: string; income: number; expense: number }> = {};
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'MMM dd');
    }).reverse();

    last30Days.forEach(day => {
      data[day] = { date: day, income: 0, expense: 0 };
    });

    transactions.forEach(t => {
      const day = format(parseISO(t.date), 'MMM dd');
      if (data[day]) {
        if (t.type === 'Income') data[day].income += t.amount;
        else data[day].expense += t.amount;
      }
    });

    return Object.values(data);
  }, [transactions]);

  const handleGenerateData = () => {
    const data = generateSyntheticData(40);
    setTransactions(data);
    setInsights([]);
  };

  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (transactions.length === 0) return;
    setIsAnalyzing(true);
    setInsights([]);
    setErrorStatus(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      setInsights(data);
    } catch (error: any) {
      console.error('Analysis failed', error);
      setErrorStatus(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Finance<span className="text-blue-600 italic">Insights</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleGenerateData}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Data
            </button>
            <button 
              onClick={() => setTransactions([])}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Balance" 
            amount={stats.balance} 
            icon={<Wallet className="w-5 h-5" />} 
            color="blue"
          />
          <StatCard 
            title="Total Income" 
            amount={stats.income} 
            icon={<TrendingUp className="w-5 h-5" />} 
            color="emerald"
          />
          <StatCard 
            title="Total Expenses" 
            amount={stats.expense} 
            icon={<TrendingDown className="w-5 h-5" />} 
            color="rose"
          />
        </div>

        {/* AI Insights Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">AI Data Analysis</h2>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || transactions.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {insights.length > 0 ? 'Re-Analyze' : 'Generate Insights'}
            </button>
          </div>
          <div className="p-6">
            {errorStatus ? (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center">
                <TrendingDown className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                <h3 className="text-rose-800 font-bold mb-1">Analysis Unavailable</h3>
                <p className="text-rose-600 text-sm max-w-md mx-auto line-clamp-2 mb-4">{errorStatus}</p>
                <button 
                  onClick={handleAnalyze}
                  className="text-xs font-semibold uppercase tracking-wider text-rose-700 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : insights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        insight.sentiment === 'positive' ? 'bg-emerald-500' : 
                        insight.sentiment === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      {insight.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{insight.analysis}</p>
                    <div className="pt-3 border-t border-slate-200/50">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Recommendation</p>
                      <p className="text-sm italic text-slate-700">"{insight.recommendation}"</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-slate-50 inline-flex p-4 rounded-full mb-3 text-slate-400">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <p className="text-slate-500">Provide some transaction data to see AI insights.</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 30-Day Spending Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" /> Expenses by Category
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 italic">No expense data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option>All</option>
                  <option>Food</option>
                  <option>Transport</option>
                  <option>Bills</option>
                  <option>Shopping</option>
                  <option>Salary</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions
                  .filter(t => filterCategory === 'All' || t.category === filterCategory)
                  .map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{format(parseISO(t.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        t.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{t.description}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${
                      t.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-20 bg-slate-50/30">
                <div className="bg-white inline-flex p-4 rounded-full border border-slate-100 mb-4 shadow-sm text-slate-300">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-slate-800 font-semibold">No data points captured</h3>
                <p className="text-slate-500 text-sm mt-1">Start by adding a transaction or generating synthetic data.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Menu */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl z-20">
        <button 
          onClick={handleGenerateData}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Quick Demo Data</span>
        </button>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, color }: { title: string; amount: number; icon: React.ReactNode; color: 'blue' | 'emerald' | 'rose' }) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900">${amount.toLocaleString()}</h4>
      </div>
      <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
}

