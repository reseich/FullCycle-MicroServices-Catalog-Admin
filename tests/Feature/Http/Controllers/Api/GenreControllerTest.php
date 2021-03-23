<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\GenreController;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Tests\Exceptions\TestException;
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

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $sendData = ['name' => 'test', 'categories_id' => [$categoriesId[0]]];
        $response = $this->json('POST', $this->routeStore(), $sendData);
        $this->assertDatabaseHas('category_genre', ['category_id' => $categoriesId[0], 'genre_id' => $response->json('id')]);
        $sendData = ['name' => 'test', 'categories_id' => [$categoriesId[1], $categoriesId[2]]];
        $response = $this->json('PUT', route('genres.update', ['genre' => $response->json('id')]), $sendData);
        $this->assertDatabaseMissing('category_genre', ['category_id' => $categoriesId[0], 'genre_id' => $response->json('id')]);
        $this->assertDatabaseHas('category_genre', ['category_id' => $categoriesId[1], 'genre_id' => $response->json('id')]);
        $this->assertDatabaseHas('category_genre', ['category_id' => $categoriesId[2], 'genre_id' => $response->json('id')]);
    }

    public function testInvalidationPostData()
    {
        $data = ['name' => '', 'categories_id' => ''];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
        $data = ['name' => str_repeat('a', 256)];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
        $data = ['is_active' => 'a'];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
        $data = ['categories_id' => 's'];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');
        $data = ['categories_id' => [100]];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $category = factory(Category::class)->create();
        $category->delete();
        $data = ['categories_id' => [$category->id]];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testInvalidationPutData()
    {
        $data = ['name' => '', 'categories_id' => ''];
        $this->assertInvalidationInUpdateAction($data, 'required');
        $data = ['name' => str_repeat('a', 256)];
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
        $data = ['is_active' => 'a'];
        $this->assertInvalidationInUpdateAction($data, 'boolean');
        $data = ['categories_id' => 's'];
        $this->assertInvalidationInUpdateAction($data, 'array');
        $data = ['categories_id' => [100]];
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testUpdate()
    {
        $this->genre = factory(Genre::class)->create(['is_active' => false]);
        $categories = factory(Category::class)->create();
        $data = ['name' => 'test',
            'is_active' => true];

        $this->assertUpdate($data + ['categories_id' => [$categories->id]], $data + ['deleted_at' => null]);

        $this->assertHasCategory($this->genre->id, $categories->id);
    }

    protected function assertHasCategory($genreId, $categoryId)
    {
        $this->assertDatabaseHas('category_genre', ['genre_id' => $genreId, 'category_id' => $categoryId]);
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
        $categories = factory(Category::class)->create();
        $data = ['name' => 'test'];
        $response = $this->assertStore($data + ['categories_id' => [$categories->id]], $data + ['is_active' => true, 'deleted_at' => null]);
        $this->assertHasCategory($response->json('id'), $categories->id);
    }

    public function testRollBackStore()
    {
        $controller = \Mockery::mock(GenreController::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $controller->shouldReceive('validate')->withAnyArgs()->andReturn($this->genre->toArray());
        $controller->shouldReceive('rulesStore')->withAnyArgs()->andReturn([]);
        $request = \Mockery::mock(Request::class);
        $controller->shouldReceive('handleRelations')->once()->andThrow(new TestException());
        $hasError = false;
        try {
            $controller->store($request);
        } catch (TestException $exception) {
            self::assertCount(1, Genre::all());
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    public function testRollBackUpdate()
    {
        $controller = \Mockery::mock(GenreController::class)->makePartial()->shouldAllowMockingProtectedMethods();
        $controller->shouldReceive('findOrFail')->withAnyArgs()->andReturn($this->genre);
        $controller->shouldReceive('validate')->withAnyArgs()->andReturn($this->genre->toArray());
        $controller->shouldReceive('rulesUpdate')->withAnyArgs()->andReturn([]);
        $request = \Mockery::mock(Request::class);
        $controller->shouldReceive('handleRelations')->once()->andThrow(new TestException());
        $hasError = false;
        try {
            $controller->store($request, 1);
        } catch (TestException $exception) {
            self::assertCount(1, Genre::all());
            $hasError = true;
        }
        $this->assertTrue($hasError);
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
