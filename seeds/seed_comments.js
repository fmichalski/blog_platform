/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('comments').del();
  return knex('comments').insert([
    { post_id: 1, user_id: 2, comment: 'Świetny post, Jan!' },
    { post_id: 2, user_id: 1, comment: 'Dziękuję za informacje, Anna.' }
  ]);
};
