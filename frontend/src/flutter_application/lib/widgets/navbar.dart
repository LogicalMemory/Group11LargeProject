import 'package:flutter/material.dart';
import 'gradient_button.dart';
import 'gradient_text.dart';
import 'outline_button.dart';
import '../screens/register_screen.dart';
import '../screens/login_screen.dart';

class Navbar extends StatelessWidget implements PreferredSizeWidget {
  const Navbar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(72);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      elevation: 0,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(bottom: BorderSide(color: Colors.grey[200]!, width: 1)),
        ),
        child: SafeArea(
          bottom: false,
          child: SizedBox(
            height: preferredSize.height,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Loop',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      ),
                      const SizedBox(width: 6),
                      GradientText(
                        text: 'U',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      SizedBox(
                        height: 36,
                        child: OutlineButton(
                          onPressed: () {
                            Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
                          },
                          child: const Text('Log in'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      SizedBox(
                        height: 40,
                        child: GradientButton(
                          onPressed: () {
                            Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterScreen()));
                          },
                          child: const Text('Get started'),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
