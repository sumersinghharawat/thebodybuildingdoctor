<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'Privacy Policy' }} - {{ config('app.name') }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: #0f172a;
            color: #e5e7eb;
        }
        .legal-card {
            background: #111827;
            border: 1px solid #1f2937;
            border-radius: 1rem;
        }
        .legal-card h2 {
            font-size: 1.15rem;
            margin-top: 1.75rem;
            margin-bottom: 0.75rem;
        }
        .legal-card p,
        .legal-card li {
            color: #cbd5e1;
        }
        .legal-card a {
            color: #93c5fd;
        }
        .text-muted {
            color: #9ca3af !important;
        }
    </style>
</head>
<body>
    <main class="container py-5">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-9">
                <div class="mb-4">
                    <a href="{{ url('/') }}" class="text-decoration-none text-secondary small">&larr; Back to home</a>
                    <h1 class="h3 text-white mt-3">{{ $title ?? 'Privacy Policy' }}</h1>
                    <p class="text-muted small mb-0">Last updated: {{ $lastUpdated ?? now()->format('F j, Y') }}</p>
                </div>

                <div class="legal-card p-4 p-md-5">
                    @yield('content')
                </div>
            </div>
        </div>
    </main>
</body>
</html>
