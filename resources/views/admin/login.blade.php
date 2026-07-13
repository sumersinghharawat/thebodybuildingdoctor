@extends('face.layout')

@section('title', 'Admin Login')
@section('subtitle', 'Administrator sign in')

@section('content')
    <div class="card face-auth-card shadow-lg border-0">
        <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
                <h2 class="h4 mb-2">Admin Login</h2>
                <p class="text-muted small mb-0">Sign in with your administrator email and password.</p>
            </div>

            @if (session('status'))
                <div class="alert alert-success py-2 small">{{ session('status') }}</div>
            @endif

            <form method="POST" action="{{ route('admin.login.store') }}" class="vstack gap-3">
                @csrf

                <div>
                    <label for="email" class="form-label small">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value="{{ old('email') }}"
                        required
                        autofocus
                        autocomplete="username"
                        class="form-control @error('email') is-invalid @enderror"
                    >
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div>
                    <label for="password" class="form-label small">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        autocomplete="current-password"
                        class="form-control @error('password') is-invalid @enderror"
                    >
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>

                <div class="form-check">
                    <input
                        id="remember"
                        type="checkbox"
                        name="remember"
                        value="1"
                        class="form-check-input"
                        @checked(old('remember'))
                    >
                    <label for="remember" class="form-check-label small">Remember me</label>
                </div>

                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary btn-lg">Sign In</button>
                </div>
            </form>

            <p class="text-center text-muted small mt-4 mb-0">
                Members use <a href="{{ route('face.login') }}" class="link-light">face scan login</a>.
            </p>
        </div>
    </div>
@endsection
