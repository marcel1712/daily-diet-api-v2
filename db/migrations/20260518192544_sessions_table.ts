import type { Knex } from "knex";

<<<<<<< HEAD

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("sessions", function(table) {
        table.uuid("session_id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").notNullable().references("user_id").inTable("users").onDelete("CASCADE");
        table.timestamp("expires_at").notNullable();
        table.timestamps(true, true);
    })
}


export async function down(): Promise<void> {}

=======
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("sessions", function (table) {
    table.uuid("session_id").primary().defaultTo(knex.fn.uuid());
    table
      .uuid("user_id")
      .notNullable()
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(): Promise<void> {}
>>>>>>> 352b79a81b3ef3464edb9a75ed151b545b142a4a
