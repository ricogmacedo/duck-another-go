import { Context, Next } from "koa";

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch(error: any) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error thrown by middleware:", error);
    }
    
    ctx.status = error.status || error.statusCode || 500;
    ctx.body = {
      error: {
        code: error.name || "INTERNAL_SERVER_ERROR",
        message: error.message || "Internal server error",
      }
    };
  }
}