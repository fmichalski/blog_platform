/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert([
        { name: 'admin', password: 'admin' }
      ]);
    });
};
