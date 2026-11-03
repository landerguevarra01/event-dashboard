<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'event_id',
    'name',
    'email',
    'phone',
    'organization',
    'notes',
    'status',
    'reviewed_by',
    'reviewed_at',
])]
class Registration extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => RegistrationStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * The staff member or admin who approved or rejected this registration.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * The attendee record created when this registration was approved.
     */
    public function attendee(): HasOne
    {
        return $this->hasOne(Attendee::class);
    }

    /**
     * Shape sent to React for registration lists.
     */
    public function toListItem(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'organization' => $this->organization,
            'notes' => $this->notes,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'registeredAt' => $this->created_at?->toIso8601String(),
            'reviewedAt' => $this->reviewed_at?->toIso8601String(),
        ];
    }
}