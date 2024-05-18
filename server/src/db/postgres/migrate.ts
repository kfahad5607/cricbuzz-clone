import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import config from "../../config";

// for migrations
async function main() {
  console.log("proce=ss.env.DB_URL ", config.POSTGRES_DB_URL);

  const migrationClient = postgres(config.POSTGRES_DB_URL, { max: 1 });
  await migrate(drizzle(migrationClient), {
    migrationsFolder: "./migrations",
  });

  await migrationClient.end();
}

main();
