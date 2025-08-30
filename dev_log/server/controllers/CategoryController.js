const Category = require('../models/CategoryModel');

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};


const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    await Category.create(name, description);
    res.status(201).json({ message: 'Category created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    await Category.update(req.params.id, name, description);
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
