import app from "./index";
import { env } from "./config/env";

const port = env.port;

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});


