import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'auth_service.dart';
import 'card_service.dart';

class ImageService {
  final ImagePicker _imagePicker = ImagePicker();
  final AuthService _authService = AuthService();
  final CardService _cardService = CardService();

  String? _selectedEventImageUrl;

  // Get the currently selected event image URL
  String? get selectedEventImageUrl => _selectedEventImageUrl;

  // Upload profile photo
  Future<String> uploadProfilePhoto() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );

      if (image == null) {
        throw Exception('No image selected');
      }

      final file = File(image.path);
      final fileSize = await file.length();

      if (fileSize > 5 * 1024 * 1024) {
        throw Exception('Image must be under 5MB');
      }

      final imageUrl = await _authService.uploadProfilePhoto(file);
      return imageUrl;
    } catch (e) {
      throw Exception('Failed to upload profile photo: $e');
    }
  }

  // Pick and upload event image
  Future<String?> pickEventImage() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image == null) {
        return _selectedEventImageUrl; // Return existing if user cancels
      }

      final file = File(image.path);
      final fileSize = await file.length();

      if (fileSize > 5 * 1024 * 1024) {
        throw Exception('Image must be under 5MB');
      }

      final imageUrl = await _cardService.uploadEventImage(file);
      _selectedEventImageUrl = imageUrl;
      return imageUrl;
    } catch (e) {
      throw Exception('Failed to upload event image: $e');
    }
  }

  // Clear selected event image
  void clearEventImage() {
    _selectedEventImageUrl = null;
  }

  // Set event image URL (for editing existing cards)
  void setEventImageUrl(String? url) {
    _selectedEventImageUrl = url;
  }
}
