import 'package:flutter/material.dart';
import '../models/card_model.dart';
import '../widgets/dialog_form_field.dart';
import '../widgets/image_picker_button.dart';

class EditCardDialog extends StatefulWidget {
  final CardModel card;
  final Future<String?> Function() onPickImage;

  const EditCardDialog({
    super.key,
    required this.card,
    required this.onPickImage,
  });

  @override
  State<EditCardDialog> createState() => _EditCardDialogState();
}

class _EditCardDialogState extends State<EditCardDialog> {
  late TextEditingController _titleController;
  late TextEditingController _descriptionController;
  late TextEditingController _timeController;
  late TextEditingController _durationController;
  late TextEditingController _locationController;
  String? _selectedEventImageUrl;
  bool _isUploadingImage = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.card.title);
    _descriptionController = TextEditingController(text: widget.card.description);
    _timeController = TextEditingController(text: widget.card.date.toIso8601String());
    _durationController = TextEditingController(text: widget.card.eventDuration ?? '60');
    _locationController = TextEditingController(text: widget.card.location ?? '');
    _selectedEventImageUrl = widget.card.eventImageUrl;
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
      title: const Text('Edit Card'),
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
              label: 'Event Time (ISO format or leave empty)',
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
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, {
            'title': _titleController.text,
            'description': _descriptionController.text,
            'time': _timeController.text,
            'duration': _durationController.text,
            'location': _locationController.text,
            'imageUrl': _selectedEventImageUrl,
          }),
          child: const Text('Update'),
        ),
      ],
    );
  }
}