/* Migration: create product table */

exports.up = pgm => {
	pgm.createTable('product', {
		id: {type: 'serial', primaryKey: true},
		description: {type: 'text', notNull: false},
	});
};

exports.down = pgm => {
	pgm.dropTable('product');
};
