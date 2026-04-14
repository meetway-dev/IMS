import * as yup from 'yup';

export const categorySchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .required('Category name is required'),
  description: yup.string().optional(),
  parentId: yup.string().optional(),
});
