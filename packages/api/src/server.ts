import app from "./app";
import { config } from "./config";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Duck Another Go API running in port ${PORT}`);
});