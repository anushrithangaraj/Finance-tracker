const express = require('express');
const { body } = require('express-validator');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Category validation rules
const categoryValidation = [
  body('name')
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 30 }).withMessage('Category name cannot exceed 30 characters')
    .trim(),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('icon').optional().isLength({ max: 5 }).withMessage('Icon too long'),
  body('color').optional().isHexColor().withMessage('Invalid color format')
];

// Get all categories for user
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ type: 1, name: 1 });
    
    // Add default categories
    const defaultCategories = getDefaultCategories();
    const allCategories = [...defaultCategories, ...categories];
    
    res.json({ categories: allCategories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Create new category
router.post('/', auth, categoryValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      user: req.user._id,
      name: name.trim(),
      type
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name: name.trim(),
      type,
      icon: icon || '📁',
      color: color || '#6B7280',
      user: req.user._id
    });

    await category.save();
    res.status(201).json({ 
      message: 'Category created successfully', 
      category 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category
router.put('/:id', auth, categoryValidation, handleValidationErrors, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot edit default categories' });
    }

    Object.assign(category, req.body);
    await category.save();

    res.json({ 
      message: 'Category updated successfully', 
      category 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default categories' });
    }

    // Check if category is used in transactions
    const transactionCount = await Transaction.countDocuments({
      user: req.user._id,
      category: category.name
    });

    if (transactionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that is used in transactions',
        transactionCount 
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Get category usage statistics
router.get('/:id/usage', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          category: category.name
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          lastUsed: { $max: '$date' }
        }
      }
    ]);

    res.json({ 
      category,
      usage: stats[0] || { totalAmount: 0, transactionCount: 0, averageAmount: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category usage' });
  }
});

// Helper function to get default categories
function getDefaultCategories() {
  return [
    // Income categories
    { name: 'salary', type: 'income', icon: '💼', color: '#10B981', isDefault: true },
    { name: 'freelance', type: 'income', icon: '💻', color: '#10B981', isDefault: true },
    { name: 'investment', type: 'income', icon: '📈', color: '#10B981', isDefault: true },
    { name: 'business', type: 'income', icon: '🏢', color: '#10B981', isDefault: true },
    { name: 'gift', type: 'income', icon: '🎁', color: '#10B981', isDefault: true },
    { name: 'other_income', type: 'income', icon: '💰', color: '#10B981', isDefault: true },
    
    // Expense categories
    { name: 'food', type: 'expense', icon: '🍕', color: '#EF4444', isDefault: true },
    { name: 'transport', type: 'expense', icon: '🚗', color: '#EF4444', isDefault: true },
    { name: 'housing', type: 'expense', icon: '🏠', color: '#EF4444', isDefault: true },
    { name: 'entertainment', type: 'expense', icon: '🎬', color: '#EF4444', isDefault: true },
    { name: 'healthcare', type: 'expense', icon: '🏥', color: '#EF4444', isDefault: true },
    { name: 'education', type: 'expense', icon: '📚', color: '#EF4444', isDefault: true },
    { name: 'shopping', type: 'expense', icon: '🛍️', color: '#EF4444', isDefault: true },
    { name: 'other_expense', type: 'expense', icon: '💸', color: '#EF4444', isDefault: true }
  ];
}

module.exports = router;