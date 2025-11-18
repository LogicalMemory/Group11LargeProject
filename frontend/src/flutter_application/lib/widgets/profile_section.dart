import 'package:flutter/material.dart';
import 'profile_image_section.dart';

class ProfileSection extends StatelessWidget {
  final String userName;
  final String? profileImageUrl;
  final String? token;
  final void Function(String? imageUrl)? onImageUploaded;

  const ProfileSection({
    super.key,
    required this.userName,
    this.profileImageUrl,
    this.token,
    this.onImageUploaded,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ProfileImageSection(
          initialImageUrl: profileImageUrl,
          token: token,
          onImageUploaded: onImageUploaded,
        ),
        const SizedBox(width: 12),
      ],
    );
  }
}
