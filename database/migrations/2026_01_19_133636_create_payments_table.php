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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();

            $table->decimal('amount', 10, 2);
            $table->string('reference')->nullable(); //IMAGE URL
            $table->enum('method', ['cash', 'card', 'gcash', 'bank']);
            $table->enum('status', ['pending', 'paid', 'failed'])->default('pending');
            // New field
            $table->timestamp('paid_at')->nullable();
            $table->string('proof_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
