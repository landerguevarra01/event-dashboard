<?php

namespace App\Http\Requests\Event;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Access to the event is already checked by the event.access middleware.
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $event = $this->route('event');
        assert($event instanceof Event);

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                // The same email can be an attendee of an event only once.
                Rule::unique('attendees', 'email')->where('event_id', $event->id),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'organization' => ['nullable', 'string', 'max:255'],
        ];
    }
}
