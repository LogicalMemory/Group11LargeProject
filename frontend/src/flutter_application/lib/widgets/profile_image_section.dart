import 'package:flutter/material.dart';
import 'profile_image_picker.dart';
import '../services/image_upload_service.dart';
import 'package:image_picker/image_picker.dart';

class ProfileImageSection extends StatefulWidget {
  final String? initialImageUrl;
  final String? token;
  final void Function(String? imageUrl)? onImageUploaded;
  const ProfileImageSection({
    Key? key,
    this.initialImageUrl,
    this.token,
    this.onImageUploaded,
  }) : super(key: key);

  @override
  State<ProfileImageSection> createState() => _ProfileImageSectionState();
}

class _ProfileImageSectionState extends State<ProfileImageSection> {
  XFile? _selectedImage;
  String? _uploadedImageUrl;
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    _uploadedImageUrl = widget.initialImageUrl;
  }

  void _onImageSelected(XFile? xfile) async {
    setState(() {
      _selectedImage = xfile;
      _uploading = true;
    });
    if (xfile != null && widget.token != null) {
      final url = await ImageUploadService.uploadProfileImage(xfile, widget.token!);
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
        ProfileImagePicker(
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
