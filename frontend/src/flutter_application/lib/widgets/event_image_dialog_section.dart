import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import '../widgets/event_image_picker.dart';
import '../services/image_upload_service.dart';

class EventImageDialogSection extends StatefulWidget {
  final String? initialImageUrl;
  final String? token;
  final void Function(String? imageUrl)? onImageUploaded;
  const EventImageDialogSection({
    Key? key,
    this.initialImageUrl,
    this.token,
    this.onImageUploaded,
  }) : super(key: key);

  @override
  State<EventImageDialogSection> createState() => _EventImageDialogSectionState();
}

class _EventImageDialogSectionState extends State<EventImageDialogSection> {
  XFile? _selectedImage;
  Uint8List? _webImageBytes;
  String? _uploadedImageUrl;
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    // Initialize _uploadedImageUrl with the initial URL
    _uploadedImageUrl = widget.initialImageUrl;
    // Also notify parent of the initial image if it exists
    if (widget.initialImageUrl != null && widget.onImageUploaded != null) {
      // Call this after the first frame to avoid calling setState during build
      WidgetsBinding.instance.addPostFrameCallback((_) {
        widget.onImageUploaded!(widget.initialImageUrl);
      });
    }
  }

  void _onImageSelectedXFile(XFile? xfile) async {
    setState(() {
      _selectedImage = xfile;
      _uploading = true;
    });
    if (xfile != null && widget.token != null) {
      final url = await ImageUploadService.uploadEventImage(xfile, widget.token!);
      setState(() {
        _uploadedImageUrl = url;
        _uploading = false;
      });
      if (widget.onImageUploaded != null) {
        widget.onImageUploaded!(url);
      }
    } else {
      setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        EventImagePicker(
          onImageSelected: _onImageSelectedXFile,
          initialImageUrl: _uploadedImageUrl ?? widget.initialImageUrl,
        ),
        if (_uploading)
          const Padding(
            padding: EdgeInsets.all(8.0),
            child: CircularProgressIndicator(),
          ),
      ],
    );
  }
}