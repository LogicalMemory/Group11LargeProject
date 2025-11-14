import 'package:flutter/material.dart';

class OutlineButton extends StatelessWidget {
  final VoidCallback onPressed;
  final Widget child;
  final EdgeInsets padding;

  const OutlineButton({super.key, required this.onPressed, required this.child, this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 12)});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
            alignment: Alignment.center,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [Color(0xFFFFFFFF), Color(0xFFFFFFFF)],
          ),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.shade200,
              blurRadius: 5,
              offset: const Offset(0, 0),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
        child: DefaultTextStyle(
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w500),
          child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [child],
          ),
        ),
      ),
    );
  }
}
