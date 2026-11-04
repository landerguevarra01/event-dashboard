<?php

namespace App\Models;

use App\Enums\EventStatus;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string|null $description
 * @property string|null $venue
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property EventStatus $status
 * @property bool $registration_enabled
 * @property Carbon|null $registration_opens_at
 * @property Carbon|null $registration_closes_at
 * @property int|null $capacity
 * @property int $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read int|null $users_count
 */
#[Fillable([
    'title',
    'slug',
    'description',
    'venue',
    'starts_at',
    'ends_at',
    'status',
    'registration_enabled',
    'registration_opens_at',
    'registration_closes_at',
    'capacity',
    'created_by',
])]
class Event extends Model
{
    /** @use HasFactory<Factory<Event>> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => EventStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'registration_enabled' => 'boolean',
            'registration_opens_at' => 'datetime',
            'registration_closes_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Generate a unique slug from the title when one isn't provided.
        static::creating(function (Event $event) {
            if (blank($event->slug)) {
                $base = Str::slug($event->title);
                $slug = $base;
                $i = 2;

                while (static::where('slug', $slug)->exists()) {
                    $slug = $base.'-'.$i++;
                }

                $event->slug = $slug;
            }
        });
    }

    /**
     * Use the slug in URLs (/events/annual-summit) instead of the numeric id.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Users assigned to this event, with their per-event role on the pivot.
     *
     * @return BelongsToMany<User, $this, Pivot, 'pivot'>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * @return HasMany<Registration, $this>
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    /**
     * @return HasMany<Attendee, $this>
     */
    public function attendees(): HasMany
    {
        return $this->hasMany(Attendee::class);
    }

    /**
     * Events a user is allowed to see: everything for a Super Admin,
     * otherwise only the events they are assigned to.
     *
     * @param  Builder<Event>  $query
     * @return Builder<Event>
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->hasRole(UserRole::SuperAdmin)) {
            return $query;
        }

        return $query->whereHas('users', fn ($q) => $q->whereKey($user->id));
    }

    /**
     * Shape sent to React for event lists (Super Admin, Event Admin, Staff).
     * Expects withCount('users') to have been applied to the query.
     *
     * @return array<string, mixed>
     */
    public function toListItem(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'venue' => $this->venue,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'startsAt' => $this->starts_at?->toIso8601String(),
            'capacity' => $this->capacity,
            'teamCount' => $this->users_count ?? 0,
        ];
    }

    /**
     * Full event shape sent to React for the event workspace pages.
     *
     * @return array<string, mixed>
     */
    public function toWorkspaceItem(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'venue' => $this->venue,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'startsAt' => $this->starts_at?->toIso8601String(),
            'endsAt' => $this->ends_at?->toIso8601String(),
            'capacity' => $this->capacity,
            'registrationEnabled' => $this->registration_enabled,
            'registrationOpensAt' => $this->registration_opens_at?->toIso8601String(),
            'registrationClosesAt' => $this->registration_closes_at?->toIso8601String(),
        ];
    }
}
