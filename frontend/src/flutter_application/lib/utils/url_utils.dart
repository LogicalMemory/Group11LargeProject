class UrlUtils {
  static String? buildAbsoluteUrl(String? path) {
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    final cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return 'http://localhost:5000/$cleanPath';
  }
}