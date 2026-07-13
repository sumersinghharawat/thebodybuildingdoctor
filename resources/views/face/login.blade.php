@extends('face.layout')

@section('title', 'Face Login')
@section('subtitle', 'Sign in with Faceplugin face scan')

@section('content')
    <div class="card face-auth-card shadow-lg border-0">
        <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
                <h2 class="h4 mb-2">Face Scan Login</h2>
                <p class="text-muted small mb-0">
                    On-premise Faceplugin recognition with liveness detection. No password required.
                </p>
            </div>

            <div class="camera-shell mb-3">
                <video id="face-video" autoplay muted playsinline></video>
                <canvas id="face-canvas" class="face-canvas-offscreen"></canvas>
                <div id="face-loading" class="camera-overlay">
                    <div class="spinner-border text-light" role="status"></div>
                    <p class="mt-3 mb-0 small" data-face-loading-text>Loading face recognition…</p>
                </div>
            </div>

            <div id="face-status" class="alert alert-secondary py-2 small mb-3" role="status">
                Loading face recognition… This can take up to a minute on first visit.
            </div>

            <div id="face-error" class="alert alert-danger py-2 small d-none" role="alert"></div>
            <div id="face-success" class="alert alert-success py-2 small d-none" role="status"></div>

            <div class="d-grid gap-2">
                <button id="face-retry-btn" type="button" class="btn btn-outline-light btn-sm d-none">
                    Clear cache &amp; retry
                </button>
                <button id="face-login-btn" type="button" class="btn btn-primary btn-lg" disabled>
                    Scan Face to Login
                </button>
            </div>

            <p class="text-center text-muted small mt-4 mb-0">
                First time here? Ask your administrator for a face enrollment link.
            </p>

            <p class="text-center text-muted small mt-2 mb-0">
                Powered by <a href="https://doc.faceplugin.com/" class="link-light" target="_blank" rel="noopener">Faceplugin</a>
            </p>
        </div>
    </div>

@endsection

@push('scripts')
    <script>
        window.FaceAuthPage = {
            mode: 'login',
            config: @json($config),
            endpoints: {
                submit: @json(route('face.login.store')),
            },
            csrfToken: @json(csrf_token()),
        };
    </script>
    @include('face.partials.vite-entry', ['entry' => 'resources/js/face-auth/login.js'])
@endpush
