class UrlUtils {
  static String toAbsoluteUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return 'https://nicholasfoutch.xyz$url';
    return url;
  }
}