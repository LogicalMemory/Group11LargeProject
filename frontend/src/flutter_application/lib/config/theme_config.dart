import 'package:flutter/material.dart';
import '../constants/app_constants.dart';

class ThemeConfig {
  static BoxShadow cardShadow() {
    return BoxShadow(
      color: Colors.black.withValues(alpha: 0.05),
      blurRadius: 10,
      offset: const Offset(0, 2),
    );
  }

  static BoxDecoration whiteCardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(AppConstants.radiusM),
      boxShadow: [cardShadow()],
    );
  }

  static InputDecoration textFieldDecoration({
    required String labelText,
    String? hintText,
  }) {
    return InputDecoration(
      labelText: labelText,
      border: const OutlineInputBorder(),
      hintText: hintText,
    );
  }

  static TextStyle get titleTextStyle => const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
      );

  static TextStyle get subtitleTextStyle => TextStyle(
        fontSize: 14,
        color: Colors.grey[600],
      );

  static TextStyle get bodyTextStyle => const TextStyle(fontSize: 12);

  static TextStyle get captionTextStyle => TextStyle(
        fontSize: 10,
        color: Colors.grey[400],
      );
}