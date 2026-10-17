import { Request, Response } from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from './product.service.js';

interface ProductParams {
  id: string;
}

interface ProductQuery {
  categoryId?: string;
}

export async function handleCreateProduct(req: Request, res: Response) {
  try {
    const { categoryId, name, description, price, stockQuantity } = req.body;

    if (!name || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({ 
        message: 'Name, price, and stockQuantity are required fields' 
      });
    }

    if (price < 0 || stockQuantity < 0) {
      return res.status(400).json({ 
        message: 'Price and stockQuantity cannot be negative' 
      });
    }

    const product = await createProduct({
      categoryId,
      name,
      description,
      price,
      stockQuantity,
    });

    return res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleGetProducts(
  req: Request<{}, {}, {}, ProductQuery>, 
  res: Response
) {
  try {
    const { categoryId } = req.query;
    const products = await getAllProducts(categoryId);
    return res.status(200).json({ products });
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleGetProductById(
  req: Request<ProductParams>, 
  res: Response
) {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ product });
  } catch (err) {
    console.error('Get product by ID error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
