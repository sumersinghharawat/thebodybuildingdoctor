<?php

namespace App\Http\Requests\FaceAuth;

use App\Services\FaceAuth\FaceRecognitionService;
use App\Support\FaceDescriptorHelper;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class FaceEnrollRequest extends FormRequest
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
        $sampleCount = (int) config('faceauth.enrollment_samples', 5);
        $descriptorLength = (int) config('faceauth.descriptor_length', 512);

        return [
            'samples' => ['required', 'array', "size:{$sampleCount}"],
            'samples.*' => ['required', 'array', "size:{$descriptorLength}"],
            'samples.*.*' => ['required', 'numeric'],
            'liveness_score' => ['required', 'numeric', 'between:0,1'],
        ];
    }

    /**
     * @return array<int, array<int, float>>
     */
    public function samples(): array
    {
        $helper = app(FaceDescriptorHelper::class);

        /** @var array<int, array<int, float|int>> $samples */
        $samples = $this->validated('samples');

        return array_map(
            static fn (array $sample): array => $helper->normalize($sample),
            $samples,
        );
    }

    public function livenessScore(): float
    {
        return (float) $this->validated('liveness_score');
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if (! app(FaceRecognitionService::class)->livenessPassed($this->livenessScore())) {
                $validator->errors()->add('liveness_score', 'Liveness verification failed. Please use your live face, not a photo or screen.');
            }
        });
    }
}
