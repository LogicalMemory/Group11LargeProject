import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'card_service.dart';
import 'auth_service.dart';
import '../constants/app_constants.dart';
import '../utils/validators.dart';

class ImageService {
  final ImagePicker _imagePicker = ImagePicker();
  final CardService _cardService = CardService();
  final AuthService _authService = AuthService();

  Future<String?> pickEventImage() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: AppConstants.maxEventImageWidth,
        maxHeight: AppConstants.maxEventImageHeight,
        imageQuality: AppConstants.imageQuality,
      );

      if (image == null) return null;

      final file = File(image.path);
      final fileSize = await file.length();

      if (!Validators.isValidImageSize(fileSize)) {
        throw Exception(
          'Image must be under ${AppConstants.maxImageSizeBytes ~/ (1024 * 1024)}MB',
        );
      }

      return await _cardService.uploadEventImage(file);
    } catch (e) {
      rethrow;
    }
  }

  Future<String> uploadProfilePhoto() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: AppConstants.maxProfileImageSize,
        maxHeight: AppConstants.maxProfileImageSize,
        imageQuality: AppConstants.imageQuality,
      );

      if (image == null) throw Exception('No image selected');

      final file = File(image.path);
      final fileSize = await file.length();

      if (!Validators.isValidImageSize(fileSize)) {
        throw Exception(
          'Image must be under ${AppConstants.maxImageSizeBytes ~/ (1024 * 1024)}MB',
        );
      }

      return await _authService.uploadProfilePhoto(file);
    } catch (e) {
      rethrow;
    }
  }
}
