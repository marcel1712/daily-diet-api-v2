import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", function (table) {
    table.uuid("user_id").primary().defaultTo(knex.fn.uuid());
    table.string("username", 30).notNullable().unique();
    table.string("email", 254).notNullable().unique();
    table.string("password", 60).notNullable();
    table.timestamps(true, true);
  });
}
