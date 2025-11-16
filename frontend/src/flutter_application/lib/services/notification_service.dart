import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';

class NotificationService {
  Future<Map<String, dynamic>> sendEventReminder({
    required String token,
    required String eventId,
  }) async {
    final url = Uri.parse('${ApiConfig.baseUrl}/api/CRUD/notifyEvent');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'token': token,
        'eventId': eventId,
      }),
    );

    final data = json.decode(response.body);

    if (response.statusCode != 200 || data['error'] != null) {
      throw Exception(data['error'] ?? 'Unable to send reminder.');
    }

    return {
      'success': true,
      'token': data['token'],
      'message': 'Reminder email sent! Check your inbox.',
    };
  }
}