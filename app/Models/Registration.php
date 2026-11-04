<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $event_id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $organization
 * @property string|null $notes
 * @property RegistrationStatus $status
 * @property int|null $reviewed_by
 * @property Carbon|null $reviewed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
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
    /** @use HasFactory<Factory<Registration>> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => RegistrationStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * The staff member or admin who approved or rejected this registration.
     *
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * The attendee record created when this registration was approved.
     *
     * @return HasOne<Attendee, $this>
     */
    public function attendee(): HasOne
    {
        return $this->hasOne(Attendee::class);
    }

    /**
     * Shape sent to React for registration lists.
     *
     * @return array<string, mixed>
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
