<?php

return [

    /*
    |--------------------------------------------------------------------------
    | face-api.js Model Assets
    |--------------------------------------------------------------------------
    |
    | Public path to TinyFaceDetector, FaceLandmark68, and FaceRecognitionNet.
    | Run: bash scripts/download-face-models.sh
    |
    */

    'models_path' => env('FACEAUTH_MODELS_PATH', '/models'),

    /*
    |--------------------------------------------------------------------------
    | Descriptor Length
    |--------------------------------------------------------------------------
    |
    | face-api.js FaceRecognitionNet outputs 128-dimensional descriptors.
    |
    */

    'descriptor_length' => 128,

    /*
    |--------------------------------------------------------------------------
    | Match Threshold (Euclidean distance)
    |--------------------------------------------------------------------------
    |
    | Maximum Euclidean distance for a match. Lower = stricter.
    | Typical face-api.js range: 0.4–0.6.
    |
    */

    'match_threshold' => (float) env('FACEAUTH_MATCH_THRESHOLD', 0.45),

    /*
    |--------------------------------------------------------------------------
    | Enrollment Samples
    |--------------------------------------------------------------------------
    */

    'enrollment_samples' => (int) env('FACEAUTH_ENROLLMENT_SAMPLES', 3),

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */

    'max_attempts_per_minute' => (int) env('FACEAUTH_MAX_ATTEMPTS_PER_MINUTE', 10),

    'require_https' => (bool) env('FACEAUTH_REQUIRE_HTTPS', true),

    /*
    |--------------------------------------------------------------------------
    | Liveness Challenges
    |--------------------------------------------------------------------------
    */

    'liveness_actions' => ['front', 'left', 'right'],

    /*
    |--------------------------------------------------------------------------
    | Enrollment Poses
    |--------------------------------------------------------------------------
    |
    | Users capture one sample per pose: front, left, right (same order).
    |
    */

    'enrollment_poses' => ['front', 'left', 'right'],

    /*
    |--------------------------------------------------------------------------
    | Redirects
    |--------------------------------------------------------------------------
    */

    'redirect_after_login' => '/dashboard',

];
