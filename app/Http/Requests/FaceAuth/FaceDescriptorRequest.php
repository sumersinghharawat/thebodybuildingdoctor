<?php

namespace App\Http\Requests\FaceAuth;

use App\Services\FaceAuth\FaceRecognitionService;
use Illuminate\Foundation\Http\FormRequest;

class FaceDescriptorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $sampleCount = (int) config('faceauth.enrollment_samples', 3);
        $length = (int) config('faceauth.descriptor_length', 128);

        return [
            'samples' => ['required', 'array', "size:{$sampleCount}"],
            'samples.*' => ['required', 'array', "size:{$length}"],
            'samples.*.*' => ['required', 'numeric'],
        ];
    }

    /**
     * @return array<int, array<int, float>>
     */
    public function samples(): array
    {
        return app(FaceRecognitionService::class)->normalizeSamples(
            $this->validated('samples'),
        );
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'samples.size' => 'Capture the required number of face samples.',
            'samples.*.size' => 'Invalid face descriptor length.',
        ];
    }
}
