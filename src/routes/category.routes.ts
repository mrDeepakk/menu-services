import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middlewares/validate.middleware';
import {
    createCategorySchema,
    updateCategorySchema,
    getCategorySchema,
    listCategoriesSchema,
    deleteCategorySchema,
} from '../validators/category.validator';

const router = Router();
const controller = new CategoryController();

/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Public
 */
router.post('/', validate(createCategorySchema), controller.create);

/**
 * @route   GET /api/v1/categories
 * @desc    List all categories
 * @access  Public
 */
router.get('/', validate(listCategoriesSchema), controller.list);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', validate(getCategorySchema), controller.getById);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Public
 */
router.put('/:id', validate(updateCategorySchema), controller.update);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Soft delete category (cascades to subcategories and items)
 * @access  Public
 */
router.delete('/:id', validate(deleteCategorySchema), controller.delete);

export default router;
