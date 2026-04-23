import * as yup from 'yup';

export const productSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .required('Product name is required'),
  sku: yup
    .string()
    .min(2, 'SKU must be at least 2 characters')
    .required('SKU is required'),
  barcode: yup.string().optional(),
  categoryId: yup
    .string()
    .required('Category is required'),
  typeId: yup
    .string()
    .uuid('Product type must be a valid UUID')
    .required('Product type is required'),
  unitId: yup
    .string()
    .uuid('Unit of measure must be a valid UUID')
    .required('Unit of measure is required'),
  price: yup
    .number()
    .positive('Price must be positive')
    .required('Price is required'),
  cost: yup
    .number()
    .positive('Cost must be positive')
    .required('Cost is required'),
  minStockLevel: yup
    .number()
    .min(0, 'Minimum stock level must be 0 or greater')
    .required('Minimum stock level is required'),
});

export const productFilterSchema = yup.object().shape({
  search: yup.string().optional(),
  categoryId: yup.string().optional(),
  isActive: yup.boolean().optional(),
});
