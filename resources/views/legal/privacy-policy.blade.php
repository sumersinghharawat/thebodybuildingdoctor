@extends('legal.layout', [
    'title' => 'Privacy Policy',
    'lastUpdated' => 'July 12, 2026',
])

@section('content')
    <p>
        {{ config('app.name') }} ("we", "us", or "our") respects your privacy. This Privacy Policy
        explains how we collect, use, store, and protect personal information when you use our website
        and member application, including passwordless face authentication.
    </p>

    <h2>1. Information We Collect</h2>
    <p>We may collect the following categories of information:</p>
    <ul>
        <li><strong>Account information:</strong> name, email address, and role assignments provided by your administrator.</li>
        <li><strong>Face authentication data:</strong> when you enroll in face login, we store a unique Facial ID assigned by our face authentication provider. We do not store raw photos or videos from your camera on our servers.</li>
        <li><strong>Technical data:</strong> IP address, browser type, device information, and authentication logs for security and fraud prevention.</li>
        <li><strong>Usage data:</strong> pages visited, course activity, and support inquiries you submit through the application.</li>
    </ul>

    <h2>2. Face Authentication (Faceplugin)</h2>
    <p>
        We use <a href="https://doc.faceplugin.com/" target="_blank" rel="noopener">Faceplugin</a> for secure,
        on-premise face login. When you use face enrollment or face login:
    </p>
    <ul>
        <li>Face recognition and liveness detection run in your browser on your device.</li>
        <li>Raw photos and videos are not stored on our servers.</li>
        <li>Only an encrypted mathematical face descriptor is stored to link your face to your account.</li>
        <li>Biometric processing does not leave your device during the scan.</li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <ul>
        <li>To authenticate you and provide access to courses, mentorship, and member features.</li>
        <li>To administer accounts created by authorized administrators.</li>
        <li>To maintain security, prevent unauthorized access, and investigate authentication failures.</li>
        <li>To respond to support requests and improve our services.</li>
        <li>To comply with legal obligations.</li>
    </ul>

    <h2>4. Legal Basis</h2>
    <p>
        Where applicable, we process personal data based on contract performance (providing the service),
        legitimate interests (security and fraud prevention), and your consent for biometric enrollment
        where required by law.
    </p>

    <h2>5. Data Sharing</h2>
    <p>We do not sell your personal information. We may share data only:</p>
    <ul>
        <li>With infrastructure providers that host our application (under confidentiality obligations).</li>
        <li>When required by law, regulation, or valid legal process.</li>
    </ul>

    <h2>6. Data Retention</h2>
    <ul>
        <li>Account data is retained while your membership is active.</li>
        <li>Encrypted face descriptors are retained until you or an administrator removes face login or deletes your account.</li>
        <li>Authentication logs are retained for a limited period for security auditing.</li>
    </ul>

    <h2>7. Your Rights</h2>
    <p>Depending on your location, you may have the right to:</p>
    <ul>
        <li>Request access to personal data we hold about you.</li>
        <li>Request correction or deletion of your data.</li>
        <li>Withdraw consent for face authentication (which may limit access if password login is unavailable).</li>
        <li>Request removal of your enrolled face data.</li>
    </ul>
    <p>
        To exercise these rights, contact us using the details below.
    </p>

    <h2>8. Security</h2>
    <p>
        We use encryption, access controls, HTTPS, rate limiting, and audit logging to protect your data.
        No method of transmission or storage is 100% secure, but we take reasonable measures to safeguard
        your information.
    </p>

    <h2>9. Children's Privacy</h2>
    <p>
        Our services are not intended for individuals under 18. Face authentication is not offered to minors.
    </p>

    <h2>10. International Transfers</h2>
    <p>
        Your information may be processed in countries where we or our service providers operate.
        We take steps to ensure appropriate safeguards are in place.
    </p>

    <h2>11. Changes to This Policy</h2>
    <p>
        We may update this Privacy Policy from time to time. The "Last updated" date at the top of this
        page will reflect the latest version. Continued use of the application after changes constitutes
        acceptance of the updated policy. Please also review our
        <a href="{{ route('terms-of-service') }}">Terms of Service</a>.
    </p>

    <h2>12. Contact Us</h2>
    <p>
        If you have questions about this Privacy Policy or your personal data, contact:
    </p>
    <p>
        <strong>{{ config('app.name') }}</strong><br>
        Email: <a href="mailto:{{ config('mail.from.address', 'info@thebodybuildingdoctor.in') }}">{{ config('mail.from.address', 'info@thebodybuildingdoctor.in') }}</a>
    </p>
@endsection
