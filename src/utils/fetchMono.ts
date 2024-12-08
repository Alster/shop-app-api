export async function fetchMono<T>(query: object, apiKey: string): Promise<T> {
	const response = await fetch(`https://api.monobank.ua/api/merchant/invoice/create`, {
		method: "POST",
		body: JSON.stringify(query),
		headers: { "X-Token": apiKey },
	});
	try {
		console.error(`Cant parse response. Status: ${response.status} ${response.statusText}`);
		return await response.json();
	} catch (error) {
		const text = await response.text();
		console.error(`Cannot parse response: ${text}`);
		throw error;
	}
}
