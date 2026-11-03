<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable([
    'event_id',
    'registration_id',
    'name',
    'email',
    'phone',
    'organization',
    'qr_token',
    'checked_in_at',
    'checked_in_by',
])]
class Attendee extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Every attendee gets a unique, random token for their QR code.
        static::creating(function (Attendee $attendee) {
            if (blank($attendee->qr_token)) {
                do {
                    $token = Str::random(40);
                } while (static::where('qr_token', $token)->exists());

                $attendee->qr_token = $token;
            }
        });
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * The registration this attendee came from. Null for walk-ins.
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    /**
     * The user who scanned this attendee in.
     */
    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    public function isCheckedIn(): bool
    {
        return $this->checked_in_at !== null;
    }

    /**
     * Shape sent to React for attendee lists.
     */
    public function toListItem(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'organization' => $this->organization,
            'source' => $this->registration_id ? 'registration' : 'walk-in',
            'qrToken' => $this->qr_token,
            'checkedIn' => $this->isCheckedIn(),
            'checkedInAt' => $this->checked_in_at?->toIso8601String(),
        ];
    }
}