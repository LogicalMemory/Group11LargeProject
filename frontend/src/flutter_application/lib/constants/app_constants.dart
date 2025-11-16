import 'package:flutter/material.dart';

class AppConstants {
  // Colors
  static const Color primaryTextColor = Color(0xFF0F172A);
  static const Color backgroundColor = Color(0xFFF5F5F7);
  static const Color orangeAccent = Color(0xFFFF7A18);
  static const Color pinkAccent = Color(0xFFFF2D55);
  static const Color purpleAccent = Color(0xFF7B2FFF);
  // Gradient
  static const List<Color> gradientColors = [orangeAccent, pinkAccent, purpleAccent];
  // Spacing
  static const double spacingXS = 4.0;
  static const double spacingS = 8.0;
  static const double spacingM = 12.0;
  static const double spacingL = 16.0;
  static const double spacingXL = 20.0;
  // Border Radius
  static const double radiusS = 8.0;
  static const double radiusM = 12.0;
  static const double radiusL = 20.0;
  static const double radiusCircle = 40.0;
  // Image Constraints
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB
  static const double maxEventImageWidth = 1920;
  static const double maxEventImageHeight = 1080;
  static const double maxProfileImageSize = 512;
  static const int imageQuality = 85;
  // Default Values
  static const String defaultEventDuration = '60';
  static const int maxCommentsDisplay = 3;
  // Messages
  static const String emptyStateMessage = 'No events found.\nAdd your first event!';
  static const String searchPromptMessage = 'Please enter a search term';
  static const String searchSuccessMessage = 'Card(s) have been retrieved';
}
