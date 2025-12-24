export const TRANSACTION_CATEGORIES = {
  income: [
    { value: 'salary', label: 'Salary', icon: '💼' },
    { value: 'freelance', label: 'Freelance', icon: '💻' },
    { value: 'investment', label: 'Investment', icon: '📈' },
    { value: 'business', label: 'Business', icon: '🏢' },
    { value: 'gift', label: 'Gift', icon: '🎁' },
    { value: 'other_income', label: 'Other Income', icon: '💰' }
  ],
  expense: [
    { value: 'food', label: 'Food', icon: '🍕' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'housing', label: 'Housing', icon: '🏠' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'other_expense', label: 'Other Expense', icon: '💸' }
  ]
};

export const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

