<?php

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Validation\ValidationException;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected UserService $userService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = new UserService();
    }

        public function test_admin_cannot_edit_self()
{
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin);

    $this->expectException(ValidationException::class);

    $this->userService->updateUser($admin, [
        'name' => 'New Name'
    ]);
}



        public function test_admin_cannot_edit_another_admin()
    {
        $admin1 = User::factory()->create(['role' => 'admin']);
        $admin2 = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin1);

        $this->expectException(ValidationException::class);

        $this->userService->updateUser($admin2, [
            'name' => 'New Name'
        ]);
    }

    public function test_admin_can_edit_receptionist()
{
    $admin = User::factory()->create(['role' => 'admin']);
    $receptionist = User::factory()->create(['role' => 'receptionist']);

    $this->actingAs($admin);

    $updated = $this->userService->updateUser($receptionist, [
        'name' => 'Updated Name'
    ]);

    $this->assertEquals('Updated Name', $updated->name);
}

public function test_admin_cannot_delete_self()
{
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin);

    $this->expectException(ValidationException::class);

    $this->userService->deleteUser($admin);
}

public function test_cannot_delete_last_remaining_admin()
{
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin);

    $this->expectException(ValidationException::class);

    $this->userService->deleteUser($admin);
}

public function test_admin_can_delete_receptionist()
{
    $admin = User::factory()->create(['role' => 'admin']);
    $receptionist = User::factory()->create(['role' => 'receptionist']);

    $this->actingAs($admin);

    $result = $this->userService->deleteUser($receptionist);

    $this->assertTrue($result);
    $this->assertDatabaseMissing('users', [
        'id' => $receptionist->id
    ]);
}



}
