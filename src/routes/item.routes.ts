import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { validate } from '../middlewares/validate.middleware';
import {
    createItemSchema,
    updateItemSchema,
    getItemSchema,
    listItemsSchema,
    getItemPriceSchema,
} from '../validators/item.validator';

const router = Router();
const controller = new ItemController();

/**
 * @route   POST /api/v1/items
 * @desc    Create a new item
 * @access  Public
 */
router.post('/', validate(createItemSchema), controller.create);

/**
 * @route   GET /api/v1/items
 * @desc    List all items with filters and search
 * @access  Public
 */
router.get('/', validate(listItemsSchema), controller.list);

/**
 * @route   GET /api/v1/items/:id
 * @desc    Get item by ID
 * @access  Public
 */
router.get('/:id', validate(getItemSchema), controller.getById);

/**
 * @route   GET /api/v1/items/:id/price
 * @desc    Get item price with dynamic calculation (CRITICAL ENDPOINT)
 * @access  Public
 */
router.get('/:id/price', validate(getItemPriceSchema), controller.getPrice);

/**
 * @route   GET /api/v1/items/:id/with-addons
 * @desc    Get item with grouped addons
 * @access  Public
 */
router.get('/:id/with-addons', validate(getItemSchema), controller.getWithAddons);

/**
 * @route   PUT /api/v1/items/:id
 * @desc    Update item
 * @access  Public
 */
router.put('/:id', validate(updateItemSchema), controller.update);

/**
 * @route   DELETE /api/v1/items/:id
 * @desc    Soft delete item
 * @access  Public
 */
router.delete('/:id', validate(getItemSchema), controller.delete);

export default router;
