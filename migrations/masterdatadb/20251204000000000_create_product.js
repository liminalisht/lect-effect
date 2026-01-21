/* Migration: create product table */

export const up = pgm => {
	pgm.createTable('product', {
		id: {type: 'serial', primaryKey: true},
		description: {type: 'text', notNull: false},
	});
};

export const down = pgm => {
	pgm.dropTable('product');
};
