import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/card_model.dart';
import 'token_storage.dart';

class CardService {
  // Reworked service to call the backend event API endpoints used by the web frontend.
  static const String baseUrl = 'https://nicholasfoutch.xyz';
  final TokenStorage _tokenStorage = TokenStorage();

  Future<String?> _getToken() async {
    return await _tokenStorage.getToken();
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
    }..addAll(token != null ? {'Authorization': 'Bearer $token'} : {});
  }

  // Upload event image (returns image URL)
  Future<String> uploadEventImage(File imageFile) async {
    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/api/CRUD/uploadPhoto'),
      );

      request.files.add(
        await http.MultipartFile.fromPath('image', imageFile.path),
      );

      print('[DEBUG] Uploading event image: ${imageFile.path}');
      final response = await request.send();
      final responseBody = await response.stream.bytesToString();
      print('[DEBUG] Upload response: ${response.statusCode} $responseBody');

      if (response.statusCode == 200) {
        final data = json.decode(responseBody);
        if (data['imageUrl'] != null) {
          return data['imageUrl'] as String;
        } else {
          throw Exception('No image URL in response');
        }
      } else {
        throw Exception('Failed to upload image: $responseBody');
      }
    } catch (e) {
      print('[ERROR] Failed to upload event image: $e');
      throw Exception('Failed to upload image: $e');
    }
  }

  // Search / retrieve events (maps to api/CRUD/searchEvents)
  Future<List<CardModel>> getCards({String? search, int? ownerId}) async {
    try {
      final token = await _getToken();
      final body = <String, dynamic>{};
      if (token != null) body['token'] = token;
      if (search != null && search.isNotEmpty) body['searchKeyword'] = search;
      if (ownerId != null) body['ownerId'] = ownerId;

      final response = await http.post(
        Uri.parse('$baseUrl/api/CRUD/searchEvents'),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final events = (data['events'] as List<dynamic>?) ?? [];
        return events.map((e) => CardModel.fromJson(e as Map<String, dynamic>)).toList();
      } else {
        throw Exception('Failed to load events: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to load events: $e');
    }
  }

  Future<CardModel> createCard(
    String title,
    String description, {
    String? time,
    String? duration,
    String? location,
    String? eventImageUrl,
  }) async {
    try {
      final token = await _getToken();
      final body = {
        'token': token,
        'eventTitle': title,
        'eventDescription': description,
        'eventTime': time ?? DateTime.now().toIso8601String(),
        'eventDuration': duration ?? '60',
        'eventLocation': location ?? '',
        'eventImageUrl': eventImageUrl,
      };

      final response = await http.post(
        Uri.parse('$baseUrl/api/CRUD/createEvent'),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        final eventObj = data['eventObject'] ?? data;
        return CardModel.fromJson(eventObj as Map<String, dynamic>);
      } else {
        throw Exception('Failed to create event: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to create event: $e');
    }
  }

  Future<CardModel> updateCard(Map<String, dynamic> payload) async {
    try {
      final token = await _getToken();
      final body = Map<String, dynamic>.from(payload);
      if (token != null) body['token'] = token;

      final response = await http.post(
        Uri.parse('$baseUrl/api/CRUD/updateEvent'),
        headers: await _getHeaders(),
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final eventObj = data['eventObject'] ?? data;
        return CardModel.fromJson(eventObj as Map<String, dynamic>);
      } else {
        throw Exception('Failed to update event: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to update event: $e');
    }
  }

  Future<void> deleteCard(String eventId) async {
    try {
      final token = await _getToken();
      final body = {'token': token, 'eventId': eventId};
      final response = await http.post(
        Uri.parse('$baseUrl/api/CRUD/deleteEvent'),
        headers: await _getHeaders(),
        body: json.encode(body),
      );
      if (response.statusCode != 200) {
        throw Exception('Failed to delete event: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to delete event: $e');
    }
  }

  Future<CardModel> toggleLike(String eventId) async {
    try {
      final token = await _getToken();
      final body = {'token': token, 'eventId': eventId};
      final response = await http.post(
        Uri.parse('$baseUrl/api/CRUD/toggleLike'),
        headers: await _getHeaders(),
        body: json.encode(body),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final eventObj = data['eventObject'] ?? data;
        return CardModel.fromJson(eventObj as Map<String, dynamic>);
      } else {
        throw Exception('Failed to toggle like: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to toggle like: $e');
    }
  }

  Future<CardModel> addComment(String eventId, String text) async {
    try {
      final token = await _getToken();
      final body = {'token': token, 'eventId': eventId, 'commentText': text};
      final response = await http.post(
        Uri.parse('$baseUrl/api/CRUD/addComment'),
        headers: await _getHeaders(),
        body: json.encode(body),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final eventObj = data['eventObject'] ?? data;
        return CardModel.fromJson(eventObj as Map<String, dynamic>);
      } else {
        throw Exception('Failed to add comment: ${response.body}');
      }
    } catch (e) {
      throw Exception('Failed to add comment: $e');
    }
  }
}