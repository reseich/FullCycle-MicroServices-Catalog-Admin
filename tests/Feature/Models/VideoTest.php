<?php


namespace Models;


use App\Models\Video;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function testRollBackStore()
    {
        try {
            Video::create([
                'title' => 'title',
                'description' => 'description',
                'year_launched' => 2021,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'genres_id' => [1, 2, 3],
                'categories_id' => [1, 2, 3]]);
            $hasError = false;
        } catch (QueryException $exception) {
            self::assertCount(0, Video::all());
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }

    public function testRollBackUpdate()
    {
        $video = factory(Video::class)->create();
        $title = $video->title;
        try {
            $video->update([
                'title' => 'title',
                'description' => 'description',
                'year_launched' => 2021,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'genres_id' => [1, 2, 3],
                'categories_id' => [1, 2, 3]]);
            $hasError = false;

        } catch (QueryException $exception) {
            self::assertDatabaseHas('videos', ['title' => $title]);
            $hasError = true;
        }
        $this->assertTrue($hasError);
    }
}
