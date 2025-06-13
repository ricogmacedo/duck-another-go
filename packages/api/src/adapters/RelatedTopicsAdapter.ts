import { DuckDuckGoApiRelatedTopic, RelatedTopic } from "../services/DuckDuckGoService";

/**
 * Adapts DuckDuckGo API data structure
 *
 * @param relatedTopics array of related topics search term
 * @returns url and title of related topic
 */
export function adaptDuckDuckGoRelatedTopics(relatedTopics: DuckDuckGoApiRelatedTopic): RelatedTopic[] {
  if (!Array.isArray(relatedTopics)) {
    console.warn("relatedTopics is not array");
    return [];
  }

  const adaptedData = relatedTopics.flatMap(item => {
    if ("Topics" in item && Array.isArray(item.Topics) && item.Topics.length > 0) {
      return adaptDuckDuckGoRelatedTopics(item.Topics);
    }

    else if ("FirstURL" in item && "Text" in item) {
      return {
          url: (!item.FirstURL ||  item.FirstURL.trim() == "") ? null : item.FirstURL,
          title: (!item.Text || item.Text.trim() == "") ? null : item.Text,
      };
    }

    return [];
  });
  
  return adaptedData.filter(item => item.url !== null && item.title !== null);
}