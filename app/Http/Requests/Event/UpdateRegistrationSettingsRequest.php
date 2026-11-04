<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRegistrationSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Access is already restricted by the role middleware on the route.
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'registration_enabled' => ['required', 'boolean'],
            'registration_opens_at' => ['nullable', 'date'],
            'registration_closes_at' => ['nullable', 'date', 'after_or_equal:registration_opens_at'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100000'],
        ];
    }
}
