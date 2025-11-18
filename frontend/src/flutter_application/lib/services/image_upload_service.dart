import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ImageUploadService {
  static Future<String?> uploadProfileImage(
    dynamic imageFile,
    String token,
  ) async {
    final uri = Uri.parse(
      'https://nicholasfoutch.xyz/api/auth/uploadProfileImage',
    );
    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer $token';
    if (kIsWeb) {
      // imageFile is XFile on web
      final bytes = await imageFile.readAsBytes();
      request.files.add(
        http.MultipartFile.fromBytes('image', bytes, filename: imageFile.name),
      );
    } else {
      // imageFile is File on mobile/desktop
      request.files.add(
        await http.MultipartFile.fromPath('image', imageFile.path),
      );
    }
    final response = await request.send();
    if (response.statusCode == 200) {
      final respStr = await response.stream.bytesToString();
      return respStr;
    }
    return null;
  }

  static Future<String?> uploadEventImage(
    dynamic imageFile,
    String token,
  ) async {
    try {
      final uri = Uri.parse('https://nicholasfoutch.xyz/api/CRUD/uploadPhoto');
      final request = http.MultipartRequest('POST', uri);

      if (kIsWeb) {
        final bytes = await imageFile.readAsBytes();

        // Determine MIME type from file extension
        String contentType = 'image/jpeg'; // default
        final fileName = imageFile.name.toLowerCase();
        if (fileName.endsWith('.png')) {
          contentType = 'image/png';
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
          contentType = 'image/jpeg';
        } else if (fileName.endsWith('.webp')) {
          contentType = 'image/webp';
        } else if (fileName.endsWith('.gif')) {
          contentType = 'image/gif';
        }

        request.files.add(
          http.MultipartFile.fromBytes(
            'image',
            bytes,
            filename: imageFile.name,
            contentType: http.MediaType.parse(contentType), // Add this!
          ),
        );
      } else {
        request.files.add(
          await http.MultipartFile.fromPath('image', imageFile.path),
        );
      }

      final response = await request.send();

      if (response.statusCode == 200) {
        final respStr = await response.stream.bytesToString();

        try {
          final jsonResponse = json.decode(respStr);

          if (jsonResponse is Map && jsonResponse['imageUrl'] != null) {
            final url = jsonResponse['imageUrl'] as String;
            return url;
          }
        } catch (e) {
          print('JSON parse error: $e');
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
