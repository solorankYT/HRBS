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
            
            $table->string('reference_number')->unique();
            $table->date('check_in');
            $table->date('check_out');
        
            $table->unsignedTinyInteger('number_of_guests')->default(1);
            $table->text('special_requests')->nullable();

            $table->enum('booking_status', [
                'pending',
                'confirmed',
                'checked_in',
                'checked_out',
                'cancelled',
                'no_show',
            ])->default('pending');
             $table->enum('payment_status', [
                'pending', 
                'submitted', 
                'verified', 
                'failed'
                ])->default('pending');

            //rebooking
            $table->timestamp('rebooked_at')->nullable();
            $table->string('rebooked_by')->nullable();
            
            //cancellation
             $table->timestamp('cancelled_at')->nullable();
             $table->string('cancelled_by')->nullable();
             $table->string('cancellation_reason')->nullable();


            $table->decimal('total_amount', 10, 2)->default(0);
            $table->timestamps();
            
            // Index for faster lookups
            $table->index([ 'check_in', 'check_out']);
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
