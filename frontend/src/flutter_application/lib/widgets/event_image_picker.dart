import 'package:flutter/foundation.dart';
import 'dart:typed_data';
// Only import dart:io File for non-web platforms
// ignore: avoid_web_libraries_in_flutter
// ignore: unused_import
import 'dart:io' show File;

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../constants/app_constants.dart';
import '../utils/url_utils.dart';

class EventImagePicker extends StatefulWidget {
  final void Function(XFile? imageFile) onImageSelected;
  final String? initialImageUrl;
  const EventImagePicker({
    Key? key,
    required this.onImageSelected,
    this.initialImageUrl,
  }) : super(key: key);

  @override
  State<EventImagePicker> createState() => _EventImagePickerState();
}

class _EventImagePickerState extends State<EventImagePicker> {
  XFile? _selectedImage;
  Uint8List? _webImageBytes;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: AppConstants.maxEventImageWidth,
      maxHeight: AppConstants.maxEventImageHeight,
      imageQuality: AppConstants.imageQuality,
    );
    if (pickedFile != null) {
      if (kIsWeb) {
        final bytes = await pickedFile.readAsBytes();
        setState(() {
          _selectedImage = pickedFile;
          _webImageBytes = bytes;
        });
        widget.onImageSelected(pickedFile);
      } else {
        setState(() => _selectedImage = pickedFile);
        widget.onImageSelected(pickedFile);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget imageWidget;
    if (_selectedImage != null) {
      imageWidget = ClipRRect(
        borderRadius: BorderRadius.circular(AppConstants.radiusM),
        child: kIsWeb && _webImageBytes != null
            ? Image.memory(
                _webImageBytes!,
                width: 120,
                height: 80,
                fit: BoxFit.cover,
              )
            : Image.file(
                File(_selectedImage!.path),
                width: 120,
                height: 80,
                fit: BoxFit.cover,
              ),
      );
    } else if (widget.initialImageUrl != null && widget.initialImageUrl!.isNotEmpty) {
      final absUrl = UrlUtils.toAbsoluteUrl(widget.initialImageUrl);
      imageWidget = ClipRRect(
        borderRadius: BorderRadius.circular(AppConstants.radiusM),
        child: Image.network(
          absUrl,
          width: 120,
          height: 80,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => Container(
            width: 120,
            height: 80,
            color: Colors.grey[300],
            child: const Icon(Icons.image, size: 40, color: Colors.grey),
          ),
        ),
      );
    } else {
      imageWidget = Container(
        width: 120,
        height: 80,
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(AppConstants.radiusM),
        ),
        child: const Icon(Icons.image, size: 40, color: Colors.grey),
      );
    }
    return Column(
      children: [
        GestureDetector(
          onTap: _pickImage,
          child: imageWidget,
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: _pickImage,
          icon: const Icon(Icons.photo_camera),
          label: const Text('Change Event Image'),
        ),
      ],
    );
  }
}
