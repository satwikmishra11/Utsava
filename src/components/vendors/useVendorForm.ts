import { useState } from 'react';
import { BudgetCategory } from '@/domain/schemas';

export function useVendorForm(onAdd: (name: string, cat: BudgetCategory, amount: string) => void) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BudgetCategory>('catering');
  const [quotedAmount, setQuotedAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), category, quotedAmount);
    setName('');
    setQuotedAmount('');
  };

  return {
    name,
    setName,
    category,
    setCategory,
    quotedAmount,
    setQuotedAmount,
    handleSubmit,
  };
}
