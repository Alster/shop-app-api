import { Config } from '../config/config';

export async function fetchMono<T>(query: any): Promise<T> {
  const response = await fetch(`https://api.monobank.ua/api/`, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'X-Token': Config.get().monoBankApiKey,
    },
  });
  return await response.json();
}
