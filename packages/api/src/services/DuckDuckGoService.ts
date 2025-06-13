import axios from "axios";
import { config } from "../config";
import { adaptDuckDuckGoRelatedTopics } from "../adapters/RelatedTopicsAdapter";
import { DuckDuckGoGETApiError, SearchQueryRequiredError } from "../errors";

interface DuckDuckGoResultItem {
    FirstURL?: string;
    Icon?: {
        Height?: string;
        URL?: string;
        Width?: string;
    };
    Result?: string;
    Text?: string;
}

interface DuckDuckGoTopicItem {
    Name?: string;
    Topics?: DuckDuckGoResultItem[];
}

export type DuckDuckGoApiRelatedTopic = (DuckDuckGoResultItem | DuckDuckGoTopicItem)[];

export interface DuckDuckGoApiResponse {
  RelatedTopics: DuckDuckGoApiRelatedTopic
}

export interface RelatedTopic {
  url: string | null;
  title: string | null;
}

export interface DuckDuckGoServiceSearchParam {
  searchQuery: string,
  pageNumber: number,
  limitNumber: number
}

interface DuckDuckGoServiceSearchPagination {
  totalItems: number,
  totalPages: number,
  currentPage: number,
  pageSize: number,
  hasNextPage: boolean,
  hasPreviousPage: boolean
}

interface DuckDuckGoServiceSearchResponse {
  data: RelatedTopic[],
  pagination: DuckDuckGoServiceSearchPagination
}

export class DuckDuckGoService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.duckDuckGoApiBaseUrl
  }

  /**
   * get DuckDuckGo Api search data
   * @param searchQuery the search term/query
   * @return DuckDuckGo API data
   * @throws error if request fail
  */
  public async search({searchQuery, pageNumber, limitNumber}: DuckDuckGoServiceSearchParam): Promise<DuckDuckGoServiceSearchResponse> {
    if (!searchQuery || typeof searchQuery !== "string" || searchQuery.trim() === "") {
      throw new SearchQueryRequiredError();
    }

    try {
      const queryString = encodeURIComponent(searchQuery);
      const apiUrl = `${this.baseUrl}/?q=${queryString}&format=json`;
      const response = await axios.get<DuckDuckGoApiResponse>(apiUrl);

      if (Object.values(response.data).length === 0 || !response.data.RelatedTopics) {
        return {
          data: [],
          pagination: {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            pageSize: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
      }

      const allAdaptedTopics = adaptDuckDuckGoRelatedTopics(response.data.RelatedTopics);

      const totalItems = allAdaptedTopics.length;
      const totalPages = Math.ceil(totalItems / limitNumber) || 1;
      const startSlice = (pageNumber - 1) * limitNumber;
      const endSlice = startSlice + limitNumber;

      const paginatedItems = allAdaptedTopics.slice(startSlice, endSlice);

      return {
        data: paginatedItems,
        pagination: {
          totalItems,
          totalPages,
          currentPage: pageNumber,
          pageSize: limitNumber,
          hasNextPage: (pageNumber < totalPages)!!,
          hasPreviousPage: (pageNumber > 1)!!
        }
      };
    } catch (error: any) {
      console.error("Error trying get DuckDuckGo API data:", error.message);
      throw new DuckDuckGoGETApiError()
    }
  }

}