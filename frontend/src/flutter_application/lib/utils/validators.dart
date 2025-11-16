import '../constants/app_constants.dart';

class Validators {
  static bool isValidImageSize(int fileSize) {
    return fileSize <= AppConstants.maxImageSizeBytes;
  }

  static String? validateTitle(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Title is required';
    }
    return null;
  }

  static String? validateDescription(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Description is required';
    }
    return null;
  }

  static String? validateDuration(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Duration is required';
    }
    final duration = int.tryParse(value);
    if (duration == null || duration <= 0) {
      return 'Duration must be a positive number';
    }
    return null;
  }

  static bool isValidDateTime(String? dateTimeStr) {
    if (dateTimeStr == null || dateTimeStr.isEmpty) return false;
    try {
      DateTime.parse(dateTimeStr);
      return true;
    } catch (e) {
      return false;
    }
  }
}