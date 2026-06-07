import keytar from 'keytar';

const SERVICE_NAME = 'PromptD_App';

export async function setAIKey(provider: 'gemini' | 'claude', key: string): Promise<void> {
  if (!key) {
    await keytar.deletePassword(SERVICE_NAME, provider);
  } else {
    await keytar.setPassword(SERVICE_NAME, provider, key);
  }
}

export async function getAIKey(provider: 'gemini' | 'claude'): Promise<string | null> {
  return await keytar.getPassword(SERVICE_NAME, provider);
}

export async function hasAIKey(provider: 'gemini' | 'claude'): Promise<boolean> {
  const key = await getAIKey(provider);
  return !!key;
}
