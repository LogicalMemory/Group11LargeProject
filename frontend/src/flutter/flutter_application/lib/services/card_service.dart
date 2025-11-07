import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/card_model.dart';
import 'token_storage.dart';

class CardService {
  static const String baseUrl = 'http://localhost:5000'; // Using 10.0.2.2 to access localhost from Android emulator
  final TokenStorage _tokenStorage = TokenStorage();

  Future<String?> _getToken() async {
    return await _tokenStorage.getToken();
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<CardModel>> getCards() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/api/cards'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => CardModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load cards');
      }
    } catch (e) {
      throw Exception('Failed to load cards: $e');
    }
  }

  Future<CardModel> createCard(String title, String description) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/api/cards'),
        headers: headers,
        body: json.encode({
          'title': title,
          'description': description,
          'date': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 201) {
        return CardModel.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to create card');
      }
    } catch (e) {
      throw Exception('Failed to create card: $e');
    }
  }

  Future<CardModel> updateCard(CardModel card) async {
    try {
      final headers = await _getHeaders();
      final response = await http.put(
        Uri.parse('$baseUrl/api/cards/${card.id}'),
        headers: headers,
        body: json.encode(card.toJson()),
      );

      if (response.statusCode == 200) {
        return CardModel.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to update card');
      }
    } catch (e) {
      throw Exception('Failed to update card: $e');
    }
  }

  Future<void> deleteCard(String cardId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.delete(
        Uri.parse('$baseUrl/api/cards/$cardId'),
        headers: headers,
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to delete card');
      }
    } catch (e) {
      throw Exception('Failed to delete card: $e');
    }
  }
}