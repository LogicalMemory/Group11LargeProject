import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'token_storage.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class AuthService {
  static const String baseUrl = 'https://nicholasfoutch.xyz';
  final TokenStorage _tokenStorage = TokenStorage();

  //Fetch user profile from backend (same behavior as website)
  Future<Map<String, dynamic>?> fetchUserProfile() async {
    try {
      final token = await _tokenStorage.getToken();
      if (token == null) return null;

      final response = await http.get(
        Uri.parse('$baseUrl/api/auth/getCurrentUser'),
        headers: {
          HttpHeaders.authorizationHeader: 'Bearer $token',
        },
      );

      if (response.statusCode != 200) return null;

      final data = jsonDecode(response.body);

      // Save updated profile image URL
      if (data['profileImageUrl'] != null) {
        await _tokenStorage.saveProfileImageUrl(data['profileImageUrl']);
      }

      return data;
    } catch (e) {
      print("Error fetching profile: $e");
      return null;
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'login': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        dynamic tokenField =
            data['token'] ??
            data['token'] ??
            data['accessToken'] ??
            data['accessToken'];
        String? token;
        if (tokenField is Map && tokenField['accessToken'] is String) {
          token = tokenField['accessToken'];
        } else if (tokenField is String) {
          token = tokenField;
        } else if (data['token'] is String) {
          token = data['token'];
        }

        if (token != null) {
          await _tokenStorage.saveToken(token);

          //after login, fetch real user profile (fixes null profile images)
          await fetchUserProfile();
        }

        return {
          'success': true,
          'user': {
            'id': data['id'],
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'profileImageUrl': data['profileImageUrl'],
          },
        };
      } else {
        final error = json.decode(response.body);
        return {'success': false, 'error': error['error'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }

  Future<Map<String, dynamic>> register(
    String firstName,
    String lastName,
    String login,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'firstName': firstName,
          'lastName': lastName,
          'login': login,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);

        dynamic tokenField = data['token'] ?? data['accessToken'];
        String? token;
        if (tokenField is Map && tokenField['accessToken'] is String) {
          token = tokenField['accessToken'];
        } else if (tokenField is String) {
          token = tokenField;
        } else if (data['token'] is String) {
          token = data['token'];
        }

        if (token != null) {
          await _tokenStorage.saveToken(token);

          //fetch profile after register
          await fetchUserProfile();
        }

        return {
          'success': true,
          'user': {
            'id': data['id'],
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'profileImageUrl': data['profileImageUrl'],
          },
        };
      } else {
        final error = json.decode(response.body);
        return {
          'success': false,
          'error': error['error'] ?? 'Registration failed',
        };
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }

  // Upload profile photo
  Future<String> uploadProfilePhoto(File imageFile) async {
    try {
      final token = await _tokenStorage.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/api/auth/uploadProfilePhoto'),
      );

      request.files.add(
        await http.MultipartFile.fromPath('image', imageFile.path),
      );

      request.fields['token'] = token;

      print('[DEBUG] Uploading profile photo: ${imageFile.path}');
      final response = await request.send();
      final responseBody = await response.stream.bytesToString();
      print('[DEBUG] Upload response: ${response.statusCode} $responseBody');

      if (response.statusCode == 200) {
        final data = json.decode(responseBody);

        if (data['token'] != null) {
          await _tokenStorage.saveToken(data['token']);
        }

        if (data['profileImageUrl'] != null) {
          // Save immediately
          await _tokenStorage.saveProfileImageUrl(data['profileImageUrl']);

          //refresh entire profile
          await fetchUserProfile();

          return data['profileImageUrl'] as String;
        } else {
          throw Exception('No profile image URL in response');
        }
      } else {
        throw Exception('Failed to upload profile photo: $responseBody');
      }
    } catch (e) {
      print('[ERROR] Failed to upload profile photo: $e');
      throw Exception('Failed to upload profile photo: $e');
    }
  }

  Future<void> logout() async {
    await _tokenStorage.deleteToken();
  }

  Future<bool> isLoggedIn() async {
    final token = await _tokenStorage.getToken();
    return token != null;
  }

  Future<String?> getToken() async {
    return await _tokenStorage.getToken();
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'auth_token');

      if (token == null || token.isEmpty) {
        print('No token found');
        return null;
      }

      if (JwtDecoder.isExpired(token)) {
        print('Token is expired');
        return null;
      }

      Map<String, dynamic> decodedToken = JwtDecoder.decode(token);

      final userId =
          decodedToken['userId'] ??
          decodedToken['id'] ??
          decodedToken['user_id'] ??
          decodedToken['sub'];

      return {
        'userId': userId,
        'firstName': decodedToken['firstName'] ?? decodedToken['first_name'],
        'lastName': decodedToken['lastName'] ?? decodedToken['last_name'],
        'profileImageUrl':
            decodedToken['profileImageUrl'] ??
            decodedToken['profile_image_url'],
      };
    } catch (e) {
      print('Error getting current user: $e');
      return null;
    }
  }
}
