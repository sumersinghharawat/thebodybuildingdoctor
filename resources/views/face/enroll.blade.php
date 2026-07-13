@extends('face.layout')

@section('title', 'Face Enrollment')
@section('subtitle', 'Register your face with Faceplugin')

@section('content')
    <div class="card face-auth-card shadow-lg border-0">
        <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
                <h2 class="h4 mb-2">Face Enrollment</h2>
                <p class="text-muted small mb-1">Enrolling: <strong>{{ $user->name }}</strong> ({{ $user->email }})</p>
                @if ($alreadyEnrolled)
                    <p class="text-warning small mb-0">A face is already registered. Re-enrolling will replace it.</p>
                @else
                    <p class="text-muted small mb-0">
                        Faceplugin will capture {{ $config['enrollmentSamples'] }} samples with liveness checks. Only encrypted descriptors are stored.
                    </p>
                @endif
            </div>

            <div class="camera-shell mb-3">
                <video id="face-video" autoplay muted playsinline></video>
                <canvas id="face-canvas" class="face-canvas-offscreen"></canvas>
                <div id="face-loading" class="camera-overlay">
                    <div class="spinner-border text-light" role="status"></div>
                    <p class="mt-3 mb-0 small" data-face-loading-text>Loading face recognition…</p>
                </div>
            </div>

            <div class="progress mb-3" role="progressbar" aria-label="Enrollment progress">
                <div id="enroll-progress" class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%"></div>
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
                <button id="face-enroll-btn" type="button" class="btn btn-success btn-lg" disabled>
                    {{ $alreadyEnrolled ? 'Re-enroll Face' : 'Start Face Enrollment' }}
                </button>
            </div>
        </div>
    </div>

@endsection

@php
    $enrollSubmitUrl = route('face.enroll.store', request()->only('user', 'expires', 'signature'));
@endphp

@push('scripts')
    <script>
        window.FaceAuthPage = {
            mode: 'enroll',
            config: @json($config),
            endpoints: {
                submit: @json($enrollSubmitUrl),
            },
            csrfToken: @json(csrf_token()),
        };
    </script>
    @include('face.partials.vite-entry', ['entry' => 'resources/js/face-auth/enroll.js'])
@endpush
