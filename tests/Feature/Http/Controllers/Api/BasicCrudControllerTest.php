<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\BasicCrudController;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Tests\Stubs\Models\UploadFilesStub;
use Tests\Stubs\Controllers\CategoryControllerStub;
use Tests\TestCase;

class BasicCrudControllerTest extends TestCase
{
    use DatabaseMigrations;

    private $controller;

    protected function setUp(): void
    {
        parent::setUp();
        UploadFilesStub::createTable();
        $this->controller = new CategoryControllerStub();
    }

    protected function tearDown(): void
    {
        UploadFilesStub::dropTable();
        parent::tearDown();
    }

    public function testIndex()
    {
        $category = UploadFilesStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $result = $this->controller->index()->toArray();
        self::assertEquals([$category->toArray()], $result);
    }

    public function testInvalidationDataInStore()
    {
        $this->expectException(ValidationException::class);
        $request = \Mockery::mock(Request::class);
        $request->shouldReceive('all')->once()->andReturn(['name' => '']);
        $this->controller->store($request);
    }

    public function testStore()
    {
        $request = \Mockery::mock(Request::class);
        $request->shouldReceive('all')->once()->andReturn(['name' => 'test_name', 'description' => 'test_description']);
        $result = $this->controller->store($request);
        self::assertEquals(UploadFilesStub::find(1)->toArray(), $result->toArray());
    }

    public function testIfFindOrFailFetchModel()
    {
        $category = UploadFilesStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);
        $result = $reflectionMethod->invokeArgs($this->controller, [$category->id]);
        $this->assertInstanceOf(UploadFilesStub::class, $result);
    }

    public function testIfFindOrFailThrowExceptionWhenIdInvalid()
    {
        $this->expectException(ModelNotFoundException::class);
        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionMethod = $reflectionClass->getMethod('findOrFail');
        $reflectionMethod->setAccessible(true);
        $reflectionMethod->invokeArgs($this->controller, [0]);
    }

    public function testUpdate()
    {
        $category = UploadFilesStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $request = \Mockery::mock(Request::class);
        $request->shouldReceive('all')->once()->andReturn(['name' => 'test_tetetete', 'description' => 'test_description']);
        $result = $this->controller->update($request, $category->id);
        self::assertEquals($result->toArray(), UploadFilesStub::find(1)->toArray());
    }

    public function testShow()
    {
        $category = UploadFilesStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $result = $this->controller->show($category->id);
        self::assertEquals($result->toArray(), UploadFilesStub::find(1)->toArray());
    }

    public function testDestroy()
    {
        $category = UploadFilesStub::create(['name' => 'test_name', 'description' => 'test_description']);
        $result = $this->controller->destroy($category->id);
        $this->createTestResponse($result)->assertStatus(204);
        self::assertCount(0, UploadFilesStub::all());
    }


}
