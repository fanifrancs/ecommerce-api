import { Request, Response } from 'express';
import { createCategory, getAllCategories, getCategoryById } from './category.service.js';

// The CategoryParams interface defines the shape of the data expected in the URL
// parameters for routes that require a category ID. In this case, it specifies
// that the `id` parameter should be a string. This is useful for type-checking
// and ensuring that the correct data is passed to the route handlers.
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
      // code 409 is used for conflict errors, which is appropriate for duplicate entries
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

/*
  Request<CategoryParams> uses TypeScript generics. "CategoryParams" is just a custom 
  interface name (not a special built-in keyword) that defines the shape of our data. 
  Express's Request type is built so that the very first generic slot always represents 
  URL parameters (req.params), which is how TypeScript knows that `id` belongs to the route.
*/

// How Express defines Request behind the scenes:
// type Request<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs> = ...

// By writing: Request<CategoryParams>
// You are telling TypeScript:

// "Plug CategoryParams into the first slot (P) of the Request definition."

// Because Express specifically designed its Request type so that the first
// slot controls req.params, TypeScript automatically maps your id: string
// property directly to req.params.id.

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