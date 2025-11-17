import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  final _storage = const FlutterSecureStorage();

  static const _tokenKey = 'auth_token';
  static const _profileImageUrlKey = 'profile_image_url';

  // Save JWT
  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  // Get JWT
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Delete JWT
  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _profileImageUrlKey);
  }

  Future<void> saveProfileImageUrl(String url) async {
    await _storage.write(key: _profileImageUrlKey, value: url);
  }

  Future<String?> getProfileImageUrl() async {
    return await _storage.read(key: _profileImageUrlKey);
  }
}
