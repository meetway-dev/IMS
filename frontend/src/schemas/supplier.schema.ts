import * as yup from 'yup';

export const supplierSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(255, 'Supplier name must be at most 255 characters')
    .required('Supplier name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .optional(),
  phone: yup
    .string()
    .max(50, 'Phone number must be at most 50 characters')
    .optional(),
  address: yup
    .string()
    .max(500, 'Address must be at most 500 characters')
    .optional(),
  contactPerson: yup
    .string()
    .max(255, 'Contact person must be at most 255 characters')
    .optional(),
  notes: yup
    .string()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional(),
});

export const supplierFilterSchema = yup.object().shape({
  search: yup.string().optional(),
});
