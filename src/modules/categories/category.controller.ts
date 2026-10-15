import { Request, Response } from 'express';
import { createCategory, getAllCategories, getCategoryById } from './category.service.js';

interface CategoryParams {
  id: string;
}

export async function handleCreateCategory(req: Request, res: Response) {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    const category = await createCategory(name, slug);
    return res.status(201).json({ message: 'Category created successfully', category });
  } catch (err: any) {
    if (err.code === '23505') { // Unique constraint violation in PostgreSQL
      return res.status(409).json({ message: 'Category name or slug already exists' });
    }
    console.error('Create category error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleGetCategories(req: Request, res: Response) {
  try {
    const categories = await getAllCategories();
    return res.status(200).json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleGetCategoryById(req: Request<CategoryParams>, res: Response) {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json({ category });
  } catch (err) {
    console.error('Get category by ID error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}