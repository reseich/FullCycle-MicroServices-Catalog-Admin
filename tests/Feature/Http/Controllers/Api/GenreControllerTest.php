<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    protected $genre;

    protected function setUp(): void
    {
        parent::setUp();
        $this->genre = factory(Genre::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('genres.index'));
        $response->assertStatus(200)->assertJson([$this->genre->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('genres.show', ['genre' => $this->genre->id]));
        $response->assertStatus(200)->assertJson($this->genre->toArray());
    }

    public function testInvalidationPostData()
    {
        $data = ['name' => ''];
        $this->assertInvalidationInStoreAction($data, 'required');
        $data = ['name' => str_repeat('a', 256)];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $data = ['is_active' => 'a'];
        $this->assertInvalidationInStoreAction($data, 'boolean');

    }

    public function testInvalidationPutData()
    {
        $data = ['name' => ''];
        $this->assertInvalidationInUpdateAction($data, 'required');
        $data = ['name' => str_repeat('a', 256)];
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
        $data = ['is_active' => 'a'];
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testUpdate()
    {
        $this->genre = factory(Genre::class)->create(['is_active' => false]);
        $data = ['name' => 'test',
            'is_active' => true];

        $this->assertUpdate($data, $data + ['deleted_at' => null]);

        $data = ['name' => 'test',
            'is_active' => false];

        $this->assertUpdate($data, $data);

    }

    public function testDelete()
    {
        $response = $this->json('DELETE', route('genres.destroy', ['genre' => $this->genre->id]));
        $genre = Genre::find($this->genre->id);
        $response->assertStatus(204);
        self::assertNull($genre);
    }

    public function testStore()
    {
        $data = ['name' => 'test'];
        $this->assertStore($data, $data + ['is_active' => true, 'deleted_at' => null]);
        $data = ['name' => 'test',
            'is_active' => false];
        $response = $this->assertStore($data, $data + ['is_active' => $data['is_active']]);
        $response->assertJsonStructure(['created_at', 'updated_at']);
    }

    protected function routeStore(): string
    {
        return route('genres.store');
    }

    protected function routeUpdate(): string
    {
        return route('genres.update', [$this->genre->id]);
    }

    protected function model(): string
    {
        return Genre::class;
    }
}
