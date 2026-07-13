@extends('legal.layout', [
    'title' => 'Terms of Service',
    'lastUpdated' => 'July 12, 2026',
])

@section('content')
    <p>
        These Terms of Service ("Terms") govern your access to and use of the {{ config('app.name') }}
        website and member application ("Service"). By accessing or using the Service, you agree to
        these Terms. If you do not agree, do not use the Service.
    </p>

    <h2>1. Eligibility</h2>
    <p>
        The Service is intended for adults aged 18 and over. Accounts are created by authorized
        administrators. You must provide accurate information and use the Service only if you have
        been granted access by {{ config('app.name') }} or its administrators.
    </p>

    <h2>2. Account Access</h2>
    <ul>
        <li>Access is provided on an invitation or enrollment basis; self-registration may not be available.</li>
        <li>You are responsible for maintaining the security of your account and enrolled authentication methods.</li>
        <li>You must not share your account, face enrollment, or authentication credentials with others.</li>
        <li>We may suspend or terminate access for violations of these Terms or for security reasons.</li>
    </ul>

    <h2>3. Face Authentication</h2>
    <p>
        The Service offers passwordless login using on-premise face recognition provided by
        <a href="https://doc.faceplugin.com/" target="_blank" rel="noopener">Faceplugin</a>. By enrolling in face login, you:
    </p>
    <ul>
        <li>Consent to the use of your device camera for identity verification.</li>
        <li>Agree that an encrypted face descriptor may be stored to link your face to your account.</li>
        <li>Understand that recognition and liveness checks run locally in your browser.</li>
        <li>Agree not to attempt to bypass, spoof, or misuse face authentication systems.</li>
    </ul>

    <h2>4. Acceptable Use</h2>
    <p>You agree not to:</p>
    <ul>
        <li>Use the Service for any unlawful purpose.</li>
        <li>Attempt to gain unauthorized access to the Service, other accounts, or systems.</li>
        <li>Copy, distribute, or commercially exploit course content without permission.</li>
        <li>Interfere with the security or operation of the Service.</li>
        <li>Use automated tools to scrape, crawl, or abuse the Service.</li>
    </ul>

    <h2>5. Educational Content</h2>
    <p>
        Courses, mentorship materials, and other content are provided for educational purposes.
        They do not constitute medical advice. You are solely responsible for decisions you make
        based on information presented through the Service. Consult qualified professionals before
        acting on health or performance-related content.
    </p>

    <h2>6. Intellectual Property</h2>
    <p>
        All content, branding, software, and materials on the Service are owned by
        {{ config('app.name') }} or its licensors and are protected by applicable intellectual
        property laws. You receive a limited, non-transferable license to access content for personal
        use while your account remains active and in good standing.
    </p>

    <h2>7. Privacy</h2>
    <p>
        Our collection and use of personal information is described in our
        <a href="{{ route('privacy-policy') }}">Privacy Policy</a>, which is incorporated into
        these Terms by reference.
    </p>

    <h2>8. Service Availability</h2>
    <p>
        We strive to keep the Service available but do not guarantee uninterrupted access.
        We may modify, suspend, or discontinue features with or without notice for maintenance,
        security, or business reasons.
    </p>

    <h2>9. Disclaimer of Warranties</h2>
    <p>
        The Service is provided "as is" and "as available" without warranties of any kind, whether
        express or implied, including merchantability, fitness for a particular purpose, and
        non-infringement. We do not warrant that authentication, content, or systems will be
        error-free or completely secure.
    </p>

    <h2>10. Limitation of Liability</h2>
    <p>
        To the fullest extent permitted by law, {{ config('app.name') }} and its administrators,
        partners, and service providers shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising from your use of the Service, including loss of
        data, unauthorized access, or reliance on educational content.
    </p>

    <h2>11. Termination</h2>
    <p>
        We may terminate or restrict your access at any time for violation of these Terms or for
        other legitimate reasons. Upon termination, your right to use the Service ends immediately.
        Provisions that by their nature should survive termination will remain in effect.
    </p>

    <h2>12. Changes to These Terms</h2>
    <p>
        We may update these Terms from time to time. The "Last updated" date at the top of this page
        indicates the current version. Continued use of the Service after changes constitutes acceptance
        of the revised Terms.
    </p>

    <h2>13. Governing Law</h2>
    <p>
        These Terms are governed by the laws applicable in the jurisdiction where
        {{ config('app.name') }} operates, without regard to conflict of law principles.
    </p>

    <h2>14. Contact</h2>
    <p>
        For questions about these Terms, contact:
    </p>
    <p>
        <strong>{{ config('app.name') }}</strong><br>
        Email: <a href="mailto:{{ config('mail.from.address', 'info@thebodybuildingdoctor.in') }}">{{ config('mail.from.address', 'info@thebodybuildingdoctor.in') }}</a>
    </p>
@endsection
