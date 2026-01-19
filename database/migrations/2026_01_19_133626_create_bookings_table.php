<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
      Schema::create('bookings', function (Blueprint $table) {
    $table->id();

    $table->foreignId('room_id')->constrained()->cascadeOnDelete();

    // Guest info
    $table->string('guest_name');
    $table->string('guest_email')->nullable();
    $table->string('guest_phone')->nullable();

    $table->date('check_in');
    $table->date('check_out');

    $table->enum('booking_status', [
        'pending',
        'confirmed',
        'checked_in',
        'checked_out',
        'cancelled'
    ])->default('pending');

    $table->timestamps();

    $table->index(['check_in', 'check_out']);
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
