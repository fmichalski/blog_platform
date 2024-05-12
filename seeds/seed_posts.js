/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('posts').del();
  return knex('posts').insert([
    { user_id: 1, title: 'Pierwszy post Jana', content: 'To jest treść pierwszego posta napisanego przez Jana Kowalskiego.' },
    { user_id: 2, title: 'Pierwszy post Anny', content: 'To jest treść pierwszego posta napisanego przez Annę Nowak.' }
  ]);
};
