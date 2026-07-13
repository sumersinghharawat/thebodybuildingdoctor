<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Face Authentication') - {{ config('app.name') }}</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="{{ asset('css/face-auth.css') }}" rel="stylesheet">
    @php
        $faceOpencvPath = rtrim(config('faceauth.opencv_path'), '/');
    @endphp
    <link rel="preload" href="{{ $faceOpencvPath }}/opencv.js" as="script">
    <link rel="preload" href="{{ $faceOpencvPath }}/opencv_js.wasm" as="fetch" crossorigin>
    <link rel="preload" href="/onnxruntime/ort-wasm-simd.wasm" as="fetch" crossorigin>
    @stack('styles')
</head>
<body class="face-auth-body">
    <main class="container py-4 py-md-5">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-8 col-xl-7">
                <div class="text-center mb-4">
                    <h1 class="h3 fw-semibold text-white">{{ config('app.name') }}</h1>
                    <p class="text-secondary mb-0">@yield('subtitle')</p>
                </div>

                @if (session('error'))
                    <div class="alert alert-danger">{{ session('error') }}</div>
                @endif

                @yield('content')
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    @stack('scripts')
</body>
</html>
