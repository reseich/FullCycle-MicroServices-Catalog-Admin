<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class CategoryControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    protected $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = factory(Category::class)->create();
    }

    public function testIndex()
    {
        $response = $this->get(route('categories.index'));
        $response->assertStatus(200)->assertJson([$this->category->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('categories.show', ['category' => $this->category->id]));
        $response->assertStatus(200)->assertJson($this->category->toArray());
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
        $this->category = factory(Category::class)->create(['is_active' => false, 'description' => null]);
        $data = ['name' => 'test',
            'description' => 'description',
            'is_active' => true];

        $this->assertUpdate($data, $data + ['deleted_at' => null]);

        $data = ['name' => 'test',
            'description' => '',
            'is_active' => true];

        $this->assertUpdate($data, array_merge($data, ['description' => null]));

        $data = ['name' => 'test',
            'description' => null,
            'is_active' => true];

        $this->assertUpdate($data, $data);
    }

    public function testDelete()
    {
        $response = $this->json('DELETE', route('categories.destroy', ['category' => $this->category->id]));
        $category = Category::find($this->category->id);
        $response->assertStatus(204);
        self::assertNull($category);
    }

    public function testStore()
    {
        $data = ['name' => 'test'];
        $this->assertStore($data, $data + ['description' => null, 'is_active' => true, 'deleted_at' => null]);

        $data = ['name' => 'test',
            'description' => 'description',
            'is_active' => false];
        $response = $this->assertStore($data, $data + ['description' => $data['description'], 'is_active' => $data['is_active']]);
        $response->assertJsonStructure(['created_at', 'updated_at']);
    }

    protected function routeStore(): string
    {
        return route('categories.store');
    }

    protected function routeUpdate(): string
    {
        return route('categories.update', [$this->category->id]);
    }

    protected function model(): string
    {
        return Category::class;
    }

}
