import { Schema } from 'effect';

export type ProductDescription = Schema.Schema.Type<typeof productDescriptionSchema>;

export const productDescriptionSchema = Schema.String.annotations({ description: 'product description' });
