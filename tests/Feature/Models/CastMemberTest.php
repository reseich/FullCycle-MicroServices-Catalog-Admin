<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Ramsey\Uuid\Uuid;
use Tests\TestCase;

class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(CastMember::class, 2)->create();
        $castMembers = CastMember::all();
        $this->assertCount(2, $castMembers);
        $castMemberKey = array_keys($castMembers->first()->getAttributes());
        $this->assertEqualsCanonicalizing(['id', 'name','type', 'created_at', 'updated_at', 'deleted_at'], $castMemberKey);
    }

    public function testCreate()
    {
        $castMember = CastMember::create(['name' => 'test1','type'=>CastMember::TYPE_DIRECTOR]);
        $castMember->refresh();
        $this->assertEquals('test1', $castMember->name);
        $this->assertEquals(CastMember::TYPE_DIRECTOR, $castMember->type);
    }

    public function testUpdate()
    {
        $castMember = factory(CastMember::class)->create(['type' => CastMember::TYPE_DIRECTOR]);
        $data = ['name' => 'test_name_updated', 'type' => CastMember::TYPE_ACTOR];
        $castMember->update($data);
        foreach ($data as $key => $value) {
            $this->assertEquals($value, $castMember->{$key});
        }

    }

    public function testUUID()
    {
        $castMember = factory(CastMember::class)->create(['name' => 'test_name']);
        self::assertTrue(Uuid::isValid($castMember->id));
    }

    public function testDelete()
    {
        $castMember = factory(CastMember::class)->create(['type' => CastMember::TYPE_DIRECTOR]);
        $castMember->delete();
        $castMembers = CastMember::all();
        $this->assertEmpty($castMembers);
    }

}
