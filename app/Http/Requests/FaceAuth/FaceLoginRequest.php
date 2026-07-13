<?php

namespace App\Http\Requests\FaceAuth;

use App\Support\FaceDescriptorHelper;
use Illuminate\Foundation\Http\FormRequest;

class FaceLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $length = (int) config('faceauth.descriptor_length', 128);
        $actions = implode(',', config('faceauth.liveness_actions', ['front', 'left', 'right']));

        return [
            'descriptor' => ['required', 'array', "size:{$length}"],
            'descriptor.*' => ['required', 'numeric'],
            'liveness_action' => ['required', 'string', "in:{$actions}"],
            'liveness_passed' => ['required', 'accepted'],
        ];
    }

    /**
     * @return array<int, float>
     */
    public function descriptor(): array
    {
        return app(FaceDescriptorHelper::class)->normalize($this->validated('descriptor'));
    }

    public function livenessAction(): string
    {
        return (string) $this->validated('liveness_action');
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'liveness_passed.accepted' => 'Complete the liveness challenge before logging in.',
            'descriptor.size' => 'Invalid face descriptor.',
        ];
    }
}
