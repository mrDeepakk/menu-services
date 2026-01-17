import { Router } from 'express';
import { SubcategoryController } from '../controllers/subcategory.controller';
import { validate } from '../middlewares/validate.middleware';
import {
    createSubcategorySchema,
    updateSubcategorySchema,
    getSubcategorySchema,
    listSubcategoriesSchema,
    deleteSubcategorySchema,
} from '../validators/subcategory.validator';

const router = Router();
const controller = new SubcategoryController();

/**
 * @route   POST /api/v1/subcategories
 * @desc    Create a new subcategory
 * @access  Public
 */
router.post('/', validate(createSubcategorySchema), controller.create);

/**
 * @route   GET /api/v1/subcategories
 * @desc    List all subcategories
 * @access  Public
 */
router.get('/', validate(listSubcategoriesSchema), controller.list);

/**
 * @route   GET /api/v1/subcategories/:id
 * @desc    Get subcategory by ID
 * @access  Public
 */
router.get('/:id', validate(getSubcategorySchema), controller.getById);

/**
 * @route   PUT /api/v1/subcategories/:id
 * @desc    Update subcategory
 * @access  Public
 */
router.put('/:id', validate(updateSubcategorySchema), controller.update);

/**
 * @route   DELETE /api/v1/subcategories/:id
 * @desc    Soft delete subcategory (cascades to items)
 * @access  Public
 */
router.delete('/:id', validate(deleteSubcategorySchema), controller.delete);

export default router;
