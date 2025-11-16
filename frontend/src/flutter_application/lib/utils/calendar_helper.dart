import 'package:url_launcher/url_launcher.dart';
import '../models/card_model.dart';

class CalendarHelper {
  static String _formatCalendarDate(DateTime date) {
    final formatted = date
        .toUtc()
        .toIso8601String()
        .replaceAll(RegExp(r'[-:]'), '')
        .split('.')[0];
    return '${formatted}Z';
  }

  static String buildGoogleCalendarUrl(CardModel card) {
    final title = Uri.encodeComponent(card.title);
    final startDate = card.date;
    final start = _formatCalendarDate(startDate);

    final durationMinutes = int.tryParse(card.eventDuration ?? '60') ?? 60;
    final endDate = startDate.add(Duration(minutes: durationMinutes));
    final end = _formatCalendarDate(endDate);

    final description = Uri.encodeComponent(card.description);
    final location = Uri.encodeComponent(card.location ?? '');

    return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
        '&text=$title'
        '&dates=$start/$end'
        '&details=$description'
        '&location=$location';
  }

  static Future<bool> addToCalendar(CardModel card) async {
    final url = buildGoogleCalendarUrl(card);
    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    return false;
  }
}
