import { adaptDuckDuckGoRelatedTopics } from './RelatedTopicsAdapter';
import { DuckDuckGoApiRelatedTopic, RelatedTopic } from '../services/DuckDuckGoService';

describe('adaptDuckDuckGoRelatedTopics', () => {
	test('should return an empty array if input is empty or not an array', () => {
		expect(adaptDuckDuckGoRelatedTopics([])).toEqual([]);
		expect(adaptDuckDuckGoRelatedTopics(null as any)).toEqual([]);
		expect(adaptDuckDuckGoRelatedTopics(undefined as any)).toEqual([]);
		expect(adaptDuckDuckGoRelatedTopics("not an array" as any)).toEqual([]);
	});

	test('should adapt direct items correctly', () => {
		const rawData: DuckDuckGoApiRelatedTopic = [
			{
				FirstURL: "http://example.com/item1",
				Text: "Item 1 Description"
			},
			{
				FirstURL: "http://example.com/item2",
				Text: "Item 2 Description"
			}
		];
		const expected: RelatedTopic[] = [
			{ url: "http://example.com/item1", title: "Item 1 Description" },
			{ url: "http://example.com/item2", title: "Item 2 Description" }
		];
		expect(adaptDuckDuckGoRelatedTopics(rawData)).toEqual(expected);
	});

	test('should adapt nested items within "Topics"', () => {
		const rawData: DuckDuckGoApiRelatedTopic = [
			{
				Name: "Group A",
				Topics: [
					{
							FirstURL: "http://example.com/nested1",
							Text: "Nested Item 1 Description"
					},
					{
							FirstURL: "http://example.com/nested2",
							Text: "Nested Item 2 Description"
					}
				]
			}
		];
		const expected: RelatedTopic[] = [
			{ url: "http://example.com/nested1", title: "Nested Item 1 Description" },
			{ url: "http://example.com/nested2", title: "Nested Item 2 Description" }
		];
		expect(adaptDuckDuckGoRelatedTopics(rawData)).toEqual(expected);
	});

	test('should adapt a mix of direct and nested items', () => {
		const rawData: DuckDuckGoApiRelatedTopic = [
			{
				FirstURL: "http://example.com/direct1",
				Text: "Direct Item 1 Description"
			},
			{
				Name: "Group B",
				Topics: [
					{
						FirstURL: "http://example.com/nested3",
						Text: "Nested Item 3 Description"
					}
				]
			},
			{
				FirstURL: "http://example.com/direct2",
				Text: "Direct Item 2 Description"
			}
		];
		const expected: RelatedTopic[] = [
			{ url: "http://example.com/direct1", title: "Direct Item 1 Description" },
			{ url: "http://example.com/nested3", title: "Nested Item 3 Description" },
			{ url: "http://example.com/direct2", title: "Direct Item 2 Description" }
		];
		expect(adaptDuckDuckGoRelatedTopics(rawData)).toEqual(expected);
	});

	test('should handle missing or empty FirstURL/Text fields', () => {
			const rawData: DuckDuckGoApiRelatedTopic = [
				{
					FirstURL: "http://example.com/valid",
					Text: "Valid Item"
				},
				{
					FirstURL: null as any,
					Text: "Null URL"
				},
				{
					FirstURL: "http://example.com/empty-text",
					Text: ""
				},
				{
					FirstURL: "http://example.com/missing-text",
				},
				{
				}
			];
			const expected: RelatedTopic[] = [
				{ url: "http://example.com/valid", title: "Valid Item" },
			];

			expect(adaptDuckDuckGoRelatedTopics(rawData)).toEqual(expected);
	});

	test('should handle empty or invalid topic groups', () => {
		const rawData: DuckDuckGoApiRelatedTopic = [
			{
				Name: "Empty Group",
				Topics: []
			},
			{
				Name: "Group with invalid item",
				Topics: [{}]
			},
			{
				FirstURL: "http://example.com/standalone",
				Text: "Standalone Item"
			}
		];
		const expected: RelatedTopic[] = [
			{ url: "http://example.com/standalone", title: "Standalone Item" }
		];
		expect(adaptDuckDuckGoRelatedTopics(rawData)).toEqual(expected);
	});

	test('should correctly adapt the complex DuckDuckGo example data', () => {
		const complexRawData: DuckDuckGoApiRelatedTopic = [
			{
				FirstURL: "http://duckduckgo.com/X_(2022_film)",
				Icon: { Height: "", URL: "", Width: "" },
				Result: "<a href=\http://duckduckgo.com/X_(2022_film)\">X (2022 film)</a>A 2022 American slasher film written, directed, produced and edited by Ti West.",
				Text: "X (2022 film) A 2022 American slasher film written, directed, produced and edited by Ti West."
			},
			{
				FirstURL: "http://duckduckgo.com/Generation_X",
				Icon: { Height: "", URL: "/i/ffcede07.jpg", Width: "" },
				Result: "<a href=\http://duckduckgo.com/Generation_X\">Generation X</a>The demographic cohort following the Baby Boomers and preceding Millennials.",
				Text: "Generation X The demographic cohort following the Baby Boomers and preceding Millennials."
			},
			{
				Name: "Art, entertainment, and media",
				Topics: [
					{
						FirstURL: "http://duckduckgo.com/X_(Dark_Horse_Comics)",
						Icon: { Height: "", URL: "/i/96b9bbc3.jpg", Width: "" },
						Result: "<a href=\http://duckduckgo.com/X_(Dark_Horse_Comics)\">X (Dark Horse Comics)</a>A comic book character who starred in his own self-titled series published by Dark Horse Comics...",
						Text: "X (Dark Horse Comics) A comic book character who starred in his own self-titled series published by Dark Horse Comics..."
					},
					{
						FirstURL: "http://duckduckgo.com/X_(Mega_Man)",
						Icon: { Height: "", URL: "", Width: "" },
						Result: "<a href=\http://duckduckgo.com/X_(Mega_Man)\">X (Mega Man)</a>A character and protagonist of Capcom's Mega Man X video game series.",
						Text: "X (Mega Man) A character and protagonist of Capcom's Mega Man X video game series."
					}
				]
			}
		];

		const expectedComplex: RelatedTopic[] = [
			{ url: "http://duckduckgo.com/X_(2022_film)", title: "X (2022 film) A 2022 American slasher film written, directed, produced and edited by Ti West." },
			{ url: "http://duckduckgo.com/Generation_X", title: "Generation X The demographic cohort following the Baby Boomers and preceding Millennials." },
			{ url: "http://duckduckgo.com/X_(Dark_Horse_Comics)", title: "X (Dark Horse Comics) A comic book character who starred in his own self-titled series published by Dark Horse Comics..." },
			{ url: "http://duckduckgo.com/X_(Mega_Man)", title: "X (Mega Man) A character and protagonist of Capcom's Mega Man X video game series." }
		];

		expect(adaptDuckDuckGoRelatedTopics(complexRawData)).toEqual(expectedComplex);
	});
});