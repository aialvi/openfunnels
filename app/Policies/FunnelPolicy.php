<?php

namespace App\Policies;

use App\Models\Funnel;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FunnelPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Funnel $funnel): bool
    {
        return $user->id === $funnel->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Funnel $funnel): bool
    {
        return $user->id === $funnel->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Funnel $funnel): bool
    {
        return $user->id === $funnel->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Funnel $funnel): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Funnel $funnel): bool
    {
        return false;
    }
}
