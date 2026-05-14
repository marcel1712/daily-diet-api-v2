import { app } from "./app.ts";

app.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    return process.exit(1); // não "return err"
  }
  console.log(`Server listening at ${address}`);
});
