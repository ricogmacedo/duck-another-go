import { StatusCodes } from "http-status-codes";
import { GeneralError } from "./GeneralError";
import { BackingServiceError } from "./BackingServiceError";

export class SearchQueryRequiredError extends GeneralError {
  constructor() {
    super("Search query is required!", StatusCodes.BAD_REQUEST);
  }
}

export class ParamsMustBeNumberError extends GeneralError {
  constructor(paramName: string) {
    super(`Param ${paramName} must be a number and greater than zero.`, StatusCodes.BAD_REQUEST);
  }
}

export class DuckDuckGoGETApiError extends BackingServiceError {
  constructor() {
    super("Error trying get DuckDuckGo API data.", StatusCodes.BAD_GATEWAY);
  }
}
