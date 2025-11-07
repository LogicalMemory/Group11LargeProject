import 'dart:convert';
import 'package:http/http.dart' as http;
import 'token_storage.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:5000';
  final TokenStorage _tokenStorage = TokenStorage();

  Future<Map<String, dynamic>> login(String login, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'login': login, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Extract the actual JWT string
        final token = data['token']?['accessToken'];

        if (token != null) {
          await _tokenStorage.saveToken(token);
        }

        return {
          'success': true,
          'user': {
            'id': data['id'],
            'firstName': data['firstName'],
            'lastName': data['lastName'],
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

        final token = data['token']?['accessToken'];

        if (token != null) {
          await _tokenStorage.saveToken(token);
        }

        return {
          'success': true,
          'user': {
            'id': data['id'],
            'firstName': data['firstName'],
            'lastName': data['lastName'],
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
}
