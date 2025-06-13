import Router from "@koa/router";
import { Context } from "koa";
import { DuckDuckGoService } from "../services/DuckDuckGoService";
import { ParamsMustBeNumberError, SearchQueryRequiredError } from "../errors";
import { SearchLogParam, logSearchQuery, getLogSearchItems } from '../logs/searchLogger';

interface PostSearchRequest {
  query: string;
  page?: number;
  limit?: number;
  history?: boolean;
}

const router = new Router();
const duckDuckGoService = new DuckDuckGoService();

/**
 * @api {get} /search Search in DuckDuckGo
 * @apiName GetSearch
 * @apiGroup Search
 *
 * @apiParam {String} query Search term text.
 * @apiParam {String} page results page number.
 * @apiParam {String} limit results limit per page.
 * @apiParam {String} fromHistory indicates if the search is from history.
 *
 * @apiSuccess {Object} data Related topic returned data.
 * @apiSuccess {Object} pagination result pagination data.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   data: [
 *     {
 *       "url:" : "...",
 *       "title:" : "...",
 *     }
 *   ],
 *   pagination": {
 *     "totalItems": 123,
 *     "totalPages": 7,
 *     "currentPage": 7,
 *     "pageSize": 20,
 *     "hasNextPage": false,
 *     "hasPreviousPage": true
 *   }
 * }
 *
 * @apiError (Client Error) 400 BadRequest Search query is required.
 * @apiError (Client Error) 400 BadRequest Param must be a number.
 * @apiError (Server Error) 502 BadGateway Error trying get DuckDuckGo API data.
 */
router.get("/search", async (ctx: Context) => {
  try {
    const { query, page, limit, history } = ctx.query;

    if (!query || typeof query !== "string" || query.trim() === "") {
      throw new SearchQueryRequiredError();
    }

    if(page && (isNaN(parseInt(page as string)) || (parseInt(page as string) < 1))) {
      throw new ParamsMustBeNumberError("page");
    }

    if(limit && (isNaN(parseInt(limit as string)) || (parseInt(limit as string) < 1))) {
      throw new ParamsMustBeNumberError("limit");
    }

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const fromHistory = !!(history && history === "true") || false;

    const resultData = await duckDuckGoService.search({
      searchQuery: query,
      pageNumber,
      limitNumber
    });

    ctx.body = resultData;
    ctx.status = 200;

    if(!fromHistory) {
      await logSearchQuery({
        method: 'GET',
        searchQuery: query,
        ...page && { pageNumber: parseInt(page as string)},
        ...limit && { limitNumber: parseInt(limit as string)}
      } as SearchLogParam);
    }
  } catch (error: any) {
    if (error && typeof error.statusCode === 'number' && typeof error.message === 'string') {
      ctx.throw(error.statusCode, error.message);
    }
    
    ctx.throw(500, "Internal Server Error");
  }
});

/**
 * @api {post} /search Search in DuckDuckGo
 * @apiName PostSearch
 * @apiGroup Search
 *
 * @apiParam {String} query Search term text.
 * @apiParam {String} page results page number.
 * @apiParam {String} limit results limit per page.
 *
 * @apiSuccess {Object} data Related topic returned data.
 * @apiSuccess {Object} pagination result pagination data.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   data: [
 *     {
 *       "url:" : "...",
 *       "title:" : "...",
 *     }
 *   ],
 *   pagination": {
 *     "totalItems": 123,
 *     "totalPages": 7,
 *     "currentPage": 7,
 *     "pageSize": 20,
 *     "hasNextPage": false,
 *     "hasPreviousPage": true
 *   }
 * }
 *
 * @apiError (Client Error) 400 BadRequest Search query is required.
 * @apiError (Client Error) 400 BadRequest `Param must be greater than zero.
 * @apiError (Server Error) 502 BadGateway Error trying get DuckDuckGo API data.
 */
router.post("/search", async (ctx: Context) => {
  try {
    const { query, page, limit, history: fromHistory = false } = ctx.request.body as PostSearchRequest;

    if (!query || typeof query !== "string" || query.trim() === "") {
      throw new SearchQueryRequiredError();
    }

    const pageNumber = page || 1;
    const limitNumber = limit || 10;

    const resultData = await duckDuckGoService.search({
      searchQuery: query,
      pageNumber,
      limitNumber
    });

    ctx.body = resultData;
    ctx.status = 200;

    if(!fromHistory) {
      await logSearchQuery({
        method: 'POST',
        searchQuery: query,
        ...(page || page === 0) && { pageNumber: page},
        ...(limit || limit === 0) && { limitNumber: limit}
      } as SearchLogParam);
    }
  } catch (error: any) {
    if (error && typeof error.statusCode === 'number' && typeof error.message === 'string') {
      ctx.throw(error.statusCode, error.message);
    }
    
    ctx.throw(500, "Internal Server Error");
  }
});

/**
 * @api {get} /search/history Search History Log
 * @apiName GetSearchHistory
 * @apiGroup Search
 *
 * @apiParam {String} items Quantity of search history log.
 *
 * @apiSuccess {Object} data Search history log.
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   data: [
        { timestamp: "2025-06-10T11:30:00.000Z", method: "GET", searchQuery: "one" },
        { timestamp: "2025-06-10T11:25:00.000Z", method: "GET", searchQuery: "two", pageNumber: 1, limitNumber: 2 },
      ]
 * }
 *
 * @apiError (Client Error) 400 BadRequest Param must be a number.
 * @apiError (Server Error) 502 BadGateway Error trying get search history log data.
 */
router.get("/search/history", async (ctx: Context) => {
  try {
    const { items } = ctx.query;

    if(items && (isNaN(parseInt(items as string)) || (parseInt(items as string) < 1))) {
      throw new ParamsMustBeNumberError("items");
    }

    const itemsToShow = parseInt(items as string) || 10;

    const resultData = await getLogSearchItems(itemsToShow);

    ctx.body = resultData;
    ctx.status = 200;
  } catch (error: any) {
    if (error && typeof error.statusCode === 'number' && typeof error.message === 'string') {
      ctx.throw(error.statusCode, error.message);
    }
    
    ctx.throw(500, "Internal Server Error");
  }
});

export default router;