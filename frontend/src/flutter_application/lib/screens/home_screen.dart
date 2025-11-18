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

    final mockEvents = [
      {
        'org': 'Hack@UCF',
        'title': 'Intro to Lockpicking & CTF Walkthrough',
        'datetime': 'Tonight · 7:00 PM',
        'location': 'ENG II Atrium',
        'likes': 187,
        'comments': 32,
      },
      {
        'org': 'KnightHacks',
        'title': 'Hackathon Kickoff Info Session',
        'datetime': 'Thu · 6:30 PM',
        'location': 'Student Union 220 (Cape Florida Ballroom)',
        'likes': 264,
        'comments': 41,
      },
      {
        'org': 'UCF Esports Club',
        'title': 'Smash Ultimate Bracket Finals',
        'datetime': 'Sat · 4:00 PM',
        'location': 'Union Esports Lounge',
        'likes': 309,
        'comments': 58,
      },
    ];

    return Scaffold(
      body: Column(
        children: [
          const Navbar(),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  // Hero with background gradient blur effect
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(vertical: isSmall ? 48 : 96, horizontal: 24),

                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 1100),
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
                              'LoopU lets students share and discover campus events in one place, from hangouts to big nights out. Add events to your calendar, get email reminders, and stay in the loop with what your friends are doing',
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
                    ),
                  ),
                  // Live Feed Section
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                    decoration: const BoxDecoration(color: Colors.white),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 1100),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Today on LoopU',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF94A3B8),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text(
                                      'Your personalized feed',
                                      style: TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            ...mockEvents.map((event) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                    color: Colors.white,
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            width: 40,
                                            height: 40,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              border: Border.all(color: Colors.white, width: 2),
                                              gradient: const LinearGradient(
                                                begin: Alignment.topLeft,
                                                end: Alignment.bottomRight,
                                                colors: [Color(0xFFFF7A18), Color(0xFFFF2D55), Color(0xFF7B2FFF)],
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  event['org'] as String,
                                                  style: const TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: FontWeight.w600,
                                                    color: Color(0xFF94A3B8),
                                                    letterSpacing: 1.2,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  event['title'] as String,
                                                  style: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w600,
                                                    color: Color(0xFF0F172A),
                                                  ),
                                                  maxLines: 2,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            event['datetime'] as String,
                                            style: const TextStyle(
                                              fontSize: 13,
                                              color: Color(0xFF64748B),
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            event['location'] as String,
                                            style: const TextStyle(
                                              fontSize: 13,
                                              color: Color(0xFF64748B),
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                            decoration: BoxDecoration(
                                              color: Colors.white,
                                              borderRadius: BorderRadius.circular(24),
                                              border: Border.all(color: const Color(0xFFFF2D55).withAlpha(51)),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.black.withAlpha(8),
                                                  blurRadius: 2,
                                                ),
                                              ],
                                            ),
                                            child: const Text(
                                              'RSVP',
                                              style: TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                                color: Color(0xFFFF2D55),
                                              ),
                                            ),
                                          ),
                                          Row(
                                            children: [
                                              Text(
                                                '❤️ ${event['likes']}',
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w500,
                                                  color: Color(0xFF64748B),
                                                ),
                                              ),
                                              const SizedBox(width: 16),
                                              Text(
                                                '💬 ${event['comments']}',
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w500,
                                                  color: Color(0xFF64748B),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
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
