<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class CastMemberControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    protected $castMember;

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = factory(CastMember::class)->create(['type' => CastMember::TYPE_DIRECTOR]);
    }

    public function testIndex()
    {
        $response = $this->get(route('cast_members.index'));
        $response->assertStatus(200)->assertJson([$this->castMember->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('cast_members.show', ['cast_member' => $this->castMember->id]));
        $response->assertStatus(200)->assertJson($this->castMember->toArray());
    }

    public function testInvalidationData()
    {
        $data = ['name' => '', 'type' => ''];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
        $data = ['type' => 'asdasds'];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }


    public function testUpdate()
    {
        $this->castMember = factory(CastMember::class)->create(['type' => CastMember::TYPE_DIRECTOR]);
        $data = ['name' => 'test',
            'type' => CastMember::TYPE_ACTOR];

        $this->assertUpdate($data, $data + ['deleted_at' => null]);

    }

    public function testDelete()
    {
        $response = $this->json('DELETE', route('cast_members.destroy', ['cast_member' => $this->castMember->id]));
        $castMember = CastMember::find($this->castMember->id);
        $response->assertStatus(204);
        self::assertNull($castMember);
    }

    public function testStore()
    {
        $data = ['name' => 'test,', 'type' => CastMember::TYPE_DIRECTOR];
        $this->assertStore($data, $data + ['type' => CastMember::TYPE_ACTOR, 'deleted_at' => null]);
        $data = ['name' => 'test',
            'type' => CastMember::TYPE_ACTOR];
        $response = $this->assertStore($data, $data + ['type' => $data['type']]);
        $response->assertJsonStructure(['created_at', 'updated_at']);
    }

    protected function routeStore(): string
    {
        return route('cast_members.store');
    }

    protected function routeUpdate(): string
    {
        return route('cast_members.update', [$this->castMember->id]);
    }

    protected function model(): string
    {
        return CastMember::class;
    }
}
