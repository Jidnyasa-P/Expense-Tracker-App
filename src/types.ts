/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Bills' 
  | 'Entertainment' 
  | 'Salary' 
  | 'Shopping' 
  | 'Medical' 
  | 'Other';

export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  date: string;
  category: TransactionCategory;
  description: string;
  amount: number;
  type: TransactionType;
}

export interface SpendingInsight {
  title: string;
  analysis: string;
  recommendation: string;
  sentiment: 'positive' | 'warning' | 'neutral';
}
