<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\VideoController;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Tests\Exceptions\TestException;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class VideoControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;

    protected $video;
    private $sendData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create(['opened' => false]);
        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2021,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90];
    }

    public function testIndex()
    {
        $response = $this->get(route('videos.index'));
        $response->assertStatus(200)->assertJson([$this->video->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('videos.show', ['video' => $this->video->id]));
        $response->assertStatus(200)->assertJson($this->video->toArray());
    }

    public function testInvalidationRequired()
    {
        $data = ['title' => '', 'description' => '', 'year_launched' => '', 'rating' => '',
            'duration' => '', 'categories_id' => '', 'genres_id' => '',];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax()
    {
        $data = ['title' => str_repeat('a', 266)];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
    }

    public function testInvalidationInteger()
    {
        $data = ['duration' => 'sssss'];
        $this->assertInvalidationInStoreAction($data, 'integer');
        $this->assertInvalidationInUpdateAction($data, 'integer');
    }

    public function testInvalidationYearLaunchedField()
    {
        $data = ['year_launched' => 'sssss'];
        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationOpenedField()
    {
        $data = ['opened' => 'sssss'];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testInvalidationCategoryField()
    {
        $data = ['categories_id' => 'sssss'];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = ['categories_id' => [100]];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $category = factory(Category::class)->create();
        $category->delete();
        $data = ['genres_id' => [$category->id]];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

    }

    public function testInvalidationGenreField()
    {
        $data = ['genres_id' => 'sssss'];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = ['genres_id' => [100]];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $genre = factory(Genre::class)->create();
        $genre->delete();
        $data = ['genres_id' => [$genre->id]];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

    }

    public function testInvalidationRatingField()
    {
        $data = ['rating' => 'sssss'];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testDelete()
    {
        $response = $this->json('DELETE', route('videos.destroy', ['video' => $this->video->id]));
        $video = Video::find($this->video->id);
        $response->assertStatus(204);
        self::assertNull($video);
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($categoriesId);
        $response = $this->json('POST', $this->routeStore(), $this->sendData + ['genres_id' => [$genre->id], 'categories_id' => [$categoriesId[0]]]);
        $this->assertDatabaseHas('category_video', ['category_id' => $categoriesId[0], 'video_id' => $response->json('id')]);
        $response = $this->json('PUT', route('videos.update', ['video' => $response->json('id')]), $this->sendData + ['genres_id' => [$genre->id], 'categories_id' => [$categoriesId[1], $categoriesId[2]]]);
        $this->assertDatabaseMissing('category_video', ['category_id' => $categoriesId[0], 'video_id' => $response->json('id')]);
        $this->assertDatabaseHas('category_video', ['category_id' => $categoriesId[1], 'video_id' => $response->json('id')]);
        $this->assertDatabaseHas('category_video', ['category_id' => $categoriesId[2], 'video_id' => $response->json('id')]);
    }

    public function testSyncGenres()
    {
        $genres = factory(Genre::class, 3)->create();
        $genresId = $genres->pluck('id')->toArray();
        $categoriesId = factory(Category::class)->create()->id;
        $genres->each(function ($genre) use ($categoriesId) {
            $genre->categories()->sync($categoriesId);
        });
        $response = $this->json('POST', $this->routeStore(), $this->sendData + ['genres_id' => [$genresId[0]], 'categories_id' => [$categoriesId]]);
        $this->assertDatabaseHas('genre_video', ['genre_id' => $genresId[0], 'video_id' => $response->json('id')]);
        $response = $this->json('PUT', route('videos.update', ['video' => $response->json('id')]), $this->sendData + ['genres_id' => [$genresId[1], $genresId[2]], 'categories_id' => [$categoriesId]]);
        $this->assertDatabaseMissing('genre_video', ['genre_id' => $genresId[0], 'video_id' => $response->json('id')]);
        $this->assertDatabaseHas('genre_video', ['genre_id' => $genresId[1], 'video_id' => $response->json('id')]);
        $this->assertDatabaseHas('genre_video', ['genre_id' => $genresId[2], 'video_id' => $response->json('id')]);
    }

    public function testSave()
    {
        $genre = factory(Genre::class)->create();
        $category = factory(Category::class)->create();
        $genre->categories()->sync($category->id);

        $data = [
            ['send_data' => $this->sendData + ['categories_id' => [$category->id], 'genres_id' => [$genre->id]],
                'test_data' => $this->sendData],
            ['send_data' => $this->sendData + ['opened' => true, 'categories_id' => [$category->id], 'genres_id' => [$genre->id]],
                'test_data' => $this->sendData + ['opened' => true]],
            ['send_data' => $this->sendData + ['rating' => Video::RATING_LIST[1], 'categories_id' => [$category->id], 'genres_id' => [$genre->id]],
                'test_data' => $this->sendData + ['rating' => Video::RATING_LIST[1]]],
        ];

        foreach ($data as $key => $value) {
            $response = $this->assertStore($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure(['created_at', 'updated_at']);
            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure(['created_at', 'updated_at']);
        }
    }

    protected function routeStore(): string
    {
        return route('videos.store');
    }

    protected function routeUpdate(): string
    {
        return route('videos.update', [$this->video->id]);
    }

    protected function model(): string
    {
        return Video::class;
    }

}
