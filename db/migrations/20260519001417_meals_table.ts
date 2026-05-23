import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("meals", function (table) {
    table.uuid("meal_id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("user_id")
      .notNullable()
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.string("description");
    table.timestamp("date").notNullable();
    table.boolean("is_on_diet").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(): Promise<void> {}
