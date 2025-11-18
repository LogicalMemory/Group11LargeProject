import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/image_upload_service.dart';
import 'event_image_picker.dart';

class EventImageSection extends StatefulWidget {
  final String? initialImageUrl;
  final String? token;
  final void Function(String? imageUrl)? onImageUploaded;
  const EventImageSection({
    Key? key,
    this.initialImageUrl,
    this.token,
    this.onImageUploaded,
  }) : super(key: key);

  @override
  State<EventImageSection> createState() => _EventImageSectionState();
}

class _EventImageSectionState extends State<EventImageSection> {
  File? _selectedImage;
  String? _uploadedImageUrl;
  bool _uploading = false;
  void _onImageSelected(XFile? xfile) async {
    File? imageFile = xfile != null ? File(xfile.path) : null;
    setState(() {
      _selectedImage = imageFile;
      _uploading = true;
    });
    if (imageFile != null && widget.token != null) {
      final url = await ImageUploadService.uploadEventImage(imageFile, widget.token!);
      setState(() {
        _uploadedImageUrl = url;
        _uploading = false;
      });
      if (widget.onImageUploaded != null) widget.onImageUploaded!(url);
    } else {
      setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        EventImagePicker(
          onImageSelected: _onImageSelected,
          initialImageUrl: _uploadedImageUrl ?? widget.initialImageUrl,
        ),
        if (_uploading) const Padding(
          padding: EdgeInsets.all(8.0),
          child: CircularProgressIndicator(),
        ),
      ],
    );
  }
}
