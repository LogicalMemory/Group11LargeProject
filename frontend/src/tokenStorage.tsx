type RawToken = {
  accessToken?: string;
  token?: RawToken | string;
  jwtToken?: RawToken | string;
};

type TokenPayload = RawToken | string | null | undefined;

const extractTokenString = (payload: TokenPayload): string | null => {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;

  if (typeof payload === 'object') {
    if (payload.accessToken && typeof payload.accessToken === 'string') {
      return payload.accessToken;
    }

    if (payload.token) {
      return extractTokenString(payload.token);
    }

    if (payload.jwtToken) {
      return extractTokenString(payload.jwtToken);
    }
  }

  return null;
};

export function storeToken(tokenPayload: TokenPayload): void {
  try {
    const tokenString = extractTokenString(tokenPayload);
    if (!tokenString) return;
    localStorage.setItem('token_data', tokenString);
  } catch (error) {
    console.error(error);
  }
}

export function retrieveToken(): string | null {
  try {
    return localStorage.getItem('token_data');
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem('token_data');
  } catch (error) {
    console.error(error);
  }
}
