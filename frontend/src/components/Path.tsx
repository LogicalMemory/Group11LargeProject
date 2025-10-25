const app_name = "nicholasfoutch.xyz";

export function buildPath(route: string): string {
  if (process.env.NODE_ENV != "development") {
    return "http://" + app_name + ":5000/" + route;
  } else {
    return "http://127.0.0.1:5000/" + route;
  }
}
