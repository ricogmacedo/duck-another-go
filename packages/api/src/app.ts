import Koa from "koa";
import bodyParser from "koa-bodyparser";
import searchRoutes from "./routes/searchRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = new Koa();
app.use(errorHandler);
app.use(bodyParser());

app.use(searchRoutes.routes());
app.use(searchRoutes.allowedMethods());

export default app;