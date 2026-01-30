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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->string('type'); 
            $table->string('description')->nullable();
            $table->unsignedTinyInteger('capacity'); 
            $table->json('amenities')->nullable();
            $table->decimal('price', 10, 2);
            $table->enum('status', ['available', 'maintenance'])->default('available');

            // New fields
            $table->json('image_urls')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
