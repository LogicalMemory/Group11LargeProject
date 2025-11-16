import 'package:flutter/material.dart';
import '../widgets/gradient_button.dart';
import '../widgets/dialog_form_field.dart';
import '../widgets/image_picker_button.dart';

class AddCardDialog extends StatefulWidget {
  final Future<String?> Function() onPickImage;
  final String? selectedImageUrl;

  const AddCardDialog({
    super.key,
    required this.onPickImage,
    this.selectedImageUrl,
  });

  @override
  State<AddCardDialog> createState() => _AddCardDialogState();
}

class _AddCardDialogState extends State<AddCardDialog> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _timeController = TextEditingController();
  final TextEditingController _durationController = TextEditingController(text: '60');
  final TextEditingController _locationController = TextEditingController();
  String? _selectedEventImageUrl;
  bool _isUploadingImage = false;

  @override
  void initState() {
    super.initState();
    _selectedEventImageUrl = widget.selectedImageUrl;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _timeController.dispose();
    _durationController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _handlePickImage() async {
    setState(() => _isUploadingImage = true);
    try {
      final imageUrl = await widget.onPickImage();
      setState(() {
        _selectedEventImageUrl = imageUrl;
        _isUploadingImage = false;
      });
    } catch (e) {
      setState(() => _isUploadingImage = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add New Event'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DialogFormField(
              controller: _titleController,
              label: 'Title',
            ),
            const SizedBox(height: 16),
            DialogFormField(
              controller: _descriptionController,
              label: 'Description',
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            DialogFormField(
              controller: _timeController,
              label: 'Event Time (ISO format, optional)',
              hint: '2024-12-01T19:00:00',
            ),
            const SizedBox(height: 16),
            DialogFormField(
              controller: _durationController,
              label: 'Duration (minutes)',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            DialogFormField(
              controller: _locationController,
              label: 'Location',
            ),
            const SizedBox(height: 16),
            ImagePickerButton(
              imageUrl: _selectedEventImageUrl,
              isUploading: _isUploadingImage,
              onPick: _handlePickImage,
              onRemove: () => setState(() => _selectedEventImageUrl = null),
            ),
          ],
        ),
      ),
      actions: [
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            OutlinedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            const SizedBox(width: 12),
            GradientButton(
              onPressed: () => Navigator.pop(context, {
                'title': _titleController.text,
                'description': _descriptionController.text,
                'time': _timeController.text,
                'duration': _durationController.text,
                'location': _locationController.text,
                'imageUrl': _selectedEventImageUrl,
              }),
              child: const Text('Add'),
            ),
          ],
        ),
      ],
    );
  }
}