<?php


namespace Models\Traits;


use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\TestCase;
use Tests\Stubs\Models\UploadFilesStub;

class UploadedFilesUnitTest extends TestCase
{
    private $obj;

    protected function setUp(): void
    {
        parent::setUp();
        $this->obj = new UploadFilesStub();
    }

    public function testUploadFile()
    {
        \Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFile($file);
        \Storage::assertExists("1/{$file->hashName()}");

    }

    public function testUploadFiles()
    {
        \Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $file2 = UploadedFile::fake()->create('video1.mp4');
        $this->obj->uploadFiles([$file, $file2]);
        \Storage::assertExists("1/{$file->hashName()}");
        \Storage::assertExists("1/{$file2->hashName()}");

    }

    public function testDeleteFile()
    {
        \Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $this->obj->uploadFile($file);
        $this->obj->deleteFile($file);
        \Storage::assertMissing("1/{$file->hashName()}");

    }

    public function testDeleteFiles()
    {
        \Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $file2 = UploadedFile::fake()->create('vide2.mp4');
        $this->obj->uploadFiles([$file, $file2]);
        $this->obj->deleteFiles([$file->hashName(), $file2]);
        \Storage::assertMissing("1/{$file->hashName()}");
        \Storage::assertMissing("1/{$file2->hashName()}");

    }

    public function testExtractFiles()
    {
        $attributes = [];
        $files = UploadFilesStub::extractFiles($attributes);
        self::assertCount(0, $attributes);
        self::assertCount(0, $files);

        $attributes = ['file1' => 'test'];
        $files = UploadFilesStub::extractFiles($attributes);
        self::assertCount(1, $attributes);
        self::assertEquals(['file1' => 'test'], $attributes);
        self::assertCount(0, $files);

        $file1 = UploadedFile::fake()->create('video.mp4');
        $attributes = ['file1' => $file1, 'other' => 'test'];
        $files = UploadFilesStub::extractFiles($attributes);
        self::assertCount(2, $attributes);
        self::assertEquals(['file1' => $file1->hashName(), 'other' => 'test'], $attributes);
        self::assertEquals($files, [$file1]);

        $file2 = UploadedFile::fake()->create('video.mp4');
        $attributes = ['file1' => $file1, 'file2' => $file2, 'other' => 'test'];
        $files = UploadFilesStub::extractFiles($attributes);
        self::assertCount(3, $attributes);
        self::assertEquals(['file1' => $file1->hashName(),'file2' => $file2->hashName(), 'other' => 'test'], $attributes);
        self::assertEquals($files, [$file1, $file2]);


    }


}
