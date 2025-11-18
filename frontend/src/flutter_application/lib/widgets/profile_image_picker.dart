import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../utils/url_utils.dart';
import '../constants/app_constants.dart';

import 'package:flutter/foundation.dart';
import 'dart:io' show File;

class ProfileImagePicker extends StatefulWidget {
  final void Function(XFile? imageFile) onImageSelected;
  final String? initialImageUrl;
  const ProfileImagePicker({
    Key? key,
    required this.onImageSelected,
    this.initialImageUrl,
  }) : super(key: key);

  @override
  State<ProfileImagePicker> createState() => _ProfileImagePickerState();
}

class _ProfileImagePickerState extends State<ProfileImagePicker> {
  XFile? _selectedImage;
  Uint8List? _webImageBytes;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: AppConstants.maxProfileImageSize,
      maxHeight: AppConstants.maxProfileImageSize,
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
      imageWidget = kIsWeb && _webImageBytes != null
          ? CircleAvatar(
              radius: 48,
              backgroundImage: MemoryImage(_webImageBytes!),
            )
          : CircleAvatar(
              radius: 48,
              backgroundImage: FileImage(File(_selectedImage!.path)),
            );
    } else if (widget.initialImageUrl != null &&
        widget.initialImageUrl!.isNotEmpty) {
      final absUrl = UrlUtils.toAbsoluteUrl(widget.initialImageUrl);
      imageWidget = CircleAvatar(
        radius: 48,
        backgroundImage: NetworkImage(absUrl),
        onBackgroundImageError: (exception, stackTrace) {
          setState(() {});
        },
        child: Icon(Icons.person, size: 48, color: Colors.grey[400]),
      );
    } else {
      imageWidget = CircleAvatar(
        radius: 48,
        child: Icon(Icons.person, size: 48, color: Colors.grey[400]),
      );
    }
    return Column(
      children: [
        GestureDetector(onTap: _pickImage, child: imageWidget),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: _pickImage,
          icon: const Icon(Icons.photo_camera),
          label: const Text('Change Photo'),
        ),
      ],
    );
  }
}
