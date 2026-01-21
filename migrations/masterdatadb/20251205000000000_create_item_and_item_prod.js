/* eslint-disable camelcase */
export const shorthands = undefined;

export const up = pgm => {
	// Create `item` table
	pgm.createTable('item', {
		id: {type: 'serial', primaryKey: true},
		description: {type: 'text', notNull: false},
		pack_size: {type: 'integer', notNull: true},
	});

	// Create `item_prod` association table linking items -> products
	pgm.createTable('item_prod', {
		item_id: {type: 'integer', notNull: true, references: 'item(id)'},
		product_id: {type: 'integer', notNull: true, references: 'product(id)'},
	});

	// Enforce uniqueness per pair and add indexes for lookups
	pgm.addConstraint('item_prod', 'item_prod_item_product_unique', {
		unique: ['item_id', 'product_id'],
	});

	pgm.createIndex('item_prod', 'item_id');
	pgm.createIndex('item_prod', 'product_id');
};

export const down = pgm => {
	// Drop association first due to FK
	pgm.dropTable('item_prod');
	pgm.dropTable('item');
};
