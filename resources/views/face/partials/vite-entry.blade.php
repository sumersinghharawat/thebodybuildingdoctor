@php
    $manifestPath = public_path('build/manifest.json');
    $chunk = null;
    $manifest = [];

    if (is_readable($manifestPath)) {
        try {
            $manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);
            $chunk = $manifest[$entry] ?? null;
        } catch (\JsonException) {
            $chunk = null;
        }
    }
@endphp

@if ($chunk)
    @foreach ($chunk['imports'] ?? [] as $import)
        @php $importChunk = $manifest[$import] ?? null; @endphp
        @if ($importChunk)
            <link rel="modulepreload" href="{{ asset('build/'.$importChunk['file']) }}">
        @endif
    @endforeach
    <link rel="modulepreload" href="{{ asset('build/'.$chunk['file']) }}">
    <script type="module" src="{{ asset('build/'.$chunk['file']) }}"></script>
@else
    @vite([$entry])
@endif
