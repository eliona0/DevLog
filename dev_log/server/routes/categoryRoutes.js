const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');

// GET all categories
router.get('/', CategoryController.getAllCategories);

// GET single category by ID
router.get('/:id', CategoryController.getCategoryById);

// POST new category
router.post('/', CategoryController.createCategory);

// PUT update category
router.put('/:id', CategoryController.updateCategory);

// DELETE category
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;
