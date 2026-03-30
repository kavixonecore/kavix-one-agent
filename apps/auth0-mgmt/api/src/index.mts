import { createApp } from "./app.mjs";

const PORT = Number(process.env["PORT"] ?? "3100");

const app = createApp();

app.listen(PORT, () => {
  console.log(`Auth0 Management API running on http://localhost:${String(PORT)}`);
  console.log(`Swagger UI: http://localhost:${String(PORT)}/swagger`);
});
