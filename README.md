# Tutor And Tap

Build "CampusConnect", a polished mobile-first functional university demo web app based on an existing blue/white Excalidraw design. This is for a Software Engineering course and MUST implement two complete end-to-end core flows with sample fictional data, and demonstrate robust error handling. NO real student/university data, NO real integration. Make the entire app work immediately in browser without signup for demo; select "Continue as Demo Student" (Alex Morgan) on welcome. Use clean deep navy (#173B72), white, cyan accents, accessible contrast, rounded cards and large 44px+ touch targets, clearly labeled accessible form controls, clear back navigation and bottom tabs Home, Bookings, Facilities, Notifications. Show small "Demo mode: fictional data" badge.
USER CASE 1: Student book tutoring. Home > Find tutoring > Choose a tutor (fictional: Jordan Lee Python, Maya Patel Statistics, Taylor Brooks Software Design) > Choose date and AVAILABLE time > Review appointment (name/course/location/date/time) > Confirm > show booking confirmation and generate student/tutor in-app notification, persist to localStorage (or database if straightforward). Time unavailable error example using "3:00 PM (Taken)" option that shows clear error and suggests alternatives; prevent double booking; show loading/confirm feedback; show My Bookings where booking can be canceled with a warning dialog then cancellation status and notification. Block cancellation for demo booking within 24 hours, explain policy and give back navigation.
USER CASE 2: Student facility check-in. Home > Facilities > Choose facility (library study room and fitness center fictional) > enter facility code or simulate QR scan > Validate access code > simulate enrollment eligibility based on demo student eligibility > record and display check-in with timestamp, facility, confirmation reference and check-in history. Use demo codes LIB-2026 and GYM-2026; invalid code should show helpful error without creating record; fitness center "restricted demo student" alternate case should show explicit access denied with next steps. Show accessible feedback. Persist records localStorage if possible.
Implement authentic app interactions not just static screenshots; every important CTA should navigate or perform its intended action. Build a notification list. Keep screen sequence diagram trace: tutoring student choose tutor/time -> app check published availability -> select & confirm -> create TutoringSession -> create Notification -> confirmation; facility student enters/scans code -> validate Facility/code -> verify eligibility via simulated EnrollmentSystem -> save FacilityCheckIn -> show confirmation. Explicitly label backend simulation/demo logic in About screen; no false claims of real enrollment lookups. Include clean concise readable headings and visible step numbers, back buttons, empty states, error states and responsive desktop-friendly mobile preview. If you can, use React + localStorage for working demo without external API keys.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tutor-and-tap.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/08111b2f-828a-4997-950f-83042b989d2c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
