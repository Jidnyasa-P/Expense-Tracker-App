/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, TransactionCategory } from './types';

const CATEGORIES: TransactionCategory[] = [
  'Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Medical', 'Other'
];

const DESCRIPTIONS: Record<TransactionCategory, string[]> = {
  Food: ['Groceries', 'Lunch at cafe', 'Dinner out', 'Starbucks', 'Pizza delivery'],
  Transport: ['Uber ride', 'Gas station', 'Train ticket', 'Bus pass', 'Bicycle repair'],
  Bills: ['Electricity', 'Water', 'Internet', 'Mobile plan', 'Insurance'],
  Entertainment: ['Netflix subscription', 'Movie tickets', 'Spotify', 'Concert', 'Video game'],
  Shopping: ['Amazon purchase', 'New shoes', 'Clothing', 'Electronics', 'Home decor'],
  Medical: ['Pharmacy', 'Doctor visit', 'Dentist', 'Vitamin supplements', 'Vision check'],
  Other: ['Gift', 'Donation', 'Maintenance', 'Unexpected fee', 'Hobby supplies'],
  Salary: ['Monthly Salary', 'Freelance Payment', 'Bonus', 'Investment Dividend']
};

export function generateSyntheticData(count: number = 30): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  // Add a salary at the start of the month
  transactions.push({
    id: 'salary-1',
    date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    category: 'Salary',
    description: 'Monthly Salary',
    amount: 5000 + Math.floor(Math.random() * 2000),
    type: 'Income'
  });

  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 30));
    
    transactions.push({
      id: `synthetic-${i}`,
      date: date.toISOString(),
      category,
      description: DESCRIPTIONS[category][Math.floor(Math.random() * DESCRIPTIONS[category].length)],
      amount: Math.floor(Math.random() * 200) + 10,
      type: 'Expense'
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
