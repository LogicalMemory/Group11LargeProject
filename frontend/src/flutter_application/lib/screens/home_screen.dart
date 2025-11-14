import 'package:flutter/material.dart';
import 'package:flutter_application/widgets/outline_button.dart';
import '../widgets/navbar.dart';
import '../widgets/gradient_button.dart';
import '../widgets/gradient_text.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isSmall = size.width < 800;

    return Scaffold(
      body: Column(
        children: [
          const Navbar(),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Hero
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(vertical: isSmall ? 48 : 96, horizontal: 24),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                    ),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: 1100),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Expanded(
                              flex: 6,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Wrap(
                                    crossAxisAlignment: WrapCrossAlignment.center,
                                    children: [
                                      Text(
                                        "See what's happening ",
                                        style: TextStyle(
                                          color: Colors.black,
                                          fontSize: isSmall ? 32 : 42,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      GradientText(
                                        text: 'in real time.',
                                        style: TextStyle(
                                          fontSize: isSmall ? 32 : 42,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'LoopU lets you discover events, RSVP instantly, and never miss a night worth remembering. Follow the orgs you love and stay in sync with your campus.',
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: isSmall ? 16 : 20,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  Row(
                                    children: [
                                      SizedBox(
                                        height: 44,
                                        child: GradientButton(
                                          onPressed: () {
                                            Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterScreen()));
                                          },
                                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                          child: const Text('Create Account'),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      SizedBox(
                                        height: 44,
                                        child: OutlineButton(
                                          onPressed: () {
                                            Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen()));
                                          },
                                          child: const Text('Log in'),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            if (!isSmall)
                              const Expanded(
                                flex: 4,
                                child: SizedBox(),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),

                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

}
