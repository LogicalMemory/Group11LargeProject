const appName = 'nicholasfoutch.xyz';
const LOCAL_API_BASE = 'http://localhost:5050/';

export function buildPath(route: string): string {
  if (process.env.NODE_ENV !== 'development') {
    return `https://${appName}/` + route;
  }

  return new URL(route, LOCAL_API_BASE).toString();
}
