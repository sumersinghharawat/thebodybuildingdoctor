# Passwordless Face Authentication (Faceplugin)

On-premise face scan login using [Faceplugin](https://doc.faceplugin.com/). Recognition and liveness run entirely in the browser — no FaceIO, no third-party biometric cloud.

## How it works

| Step | Login | Enrollment |
|------|-------|------------|
| 1 | User opens `/face/login` | Admin issues enroll link |
| 2 | Camera opens automatically | User opens `/face/enroll` |
| 3 | Faceplugin detects face + liveness | Captures 5 samples |
| 4 | 512-dim descriptor sent to Laravel | Averaged descriptor encrypted |
| 5 | Cosine similarity match on server | Stored in `users.face_descriptor` |
| 6 | `Auth::login()` → dashboard | Redirect to dashboard |

## Setup

### 1. Install dependencies and copy models

```bash
npm install
npm run faceplugin:copy
npm run build
```

This copies ONNX models and OpenCV runtime to `public/faceplugin/`.

### 2. Run migrations

```bash
php artisan migrate
```

### 3. Configure `.env` (optional)

```env
FACEAUTH_MATCH_THRESHOLD=0.5
FACEAUTH_LIVENESS_THRESHOLD=0.5
FACEAUTH_ENROLLMENT_SAMPLES=5
```

### 4. FaceIO Console URLs (if required)

- Privacy Policy: `https://your-domain.com/privacy-policy`
- Terms of Service: `https://your-domain.com/terms-of-service`

### 5. Enroll a user

```bash
php artisan face:enroll-link user@example.com
```

### 6. Login

Visit `/face/login` → **Scan Face to Login**

## Faceplugin docs

- [Faceplugin Documentation](https://doc.faceplugin.com/)
- [JavaScript SDK on GitHub](https://github.com/Faceplugin-ltd/FaceRecognition-LivenessDetection-Javascript)

## License note

Faceplugin offers open-source and commercial SDKs. Contact [Faceplugin](https://doc.faceplugin.com/request-a-license-and-support) for production licensing if required.

## Security

- On-premise browser processing (no biometric cloud)
- Encrypted 512-dim descriptors at rest
- Faceplugin liveness anti-spoofing
- CSRF, HTTPS, rate limiting, audit logs
- Single-face validation

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Models missing | `npm run faceplugin:copy` |
| Build error | `npm run build` after install |
| Face not recognized | Re-enroll with better lighting |
| Liveness failed | Use live face, improve lighting |
