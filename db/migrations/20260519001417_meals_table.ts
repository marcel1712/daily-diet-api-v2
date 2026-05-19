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

/*
meal_id — UUID, primary key
user_id — UUID, foreign key referenciando users
name — string, nome da refeição
description — string, descrição
date — timestamp, data e hora da refeição
is_on_diet — boolean, se está dentro da dieta
created_at e updated_at — timestamps automáticos
*/
