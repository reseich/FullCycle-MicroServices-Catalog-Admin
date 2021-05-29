<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Rules\GenresHasCategoriesRule;
use Illuminate\Http\Request;
use App\Http\Resources\VideoResource;
use Illuminate\Database\Eloquent\Builder;

class VideoController extends BasicCrudController
{

    /**
     * @var string[]
     */
    private $rules;

    protected function model()
    {
        return Video::class;
    }

    public function __construct()
    {
        $this->rules = [
            'title' => 'string|required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y|min:1',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer|min:1',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => ['required', 'array', 'exists:genres,id,deleted_at,NULL'],
            'thumb_file' => 'image|max:' . Video::THUMB_FILE_MAX_SIZE, //5MB
            'banner_file' => 'image|max:' . Video::BANNER_FILE_MAX_SIZE, //10MB
            'trailer_file' => 'mimetypes:video/mp4|max:' . Video::TRAILER_FILE_MAX_SIZE, //1GB
            'video_file' => 'mimetypes:video/mp4|max:' . Video::VIDEO_FILE_MAX_SIZE, //50GB
            'cast_members_id' => [
                'required',
                'array',
                'exists:cast_members,id,deleted_at,NULL',
            ],
        ];
    }

    protected function addRuleIfGenreHasCategory(Request $request)
    {
        $categoriesId = $request->get('categories_id');
        $categoriesId = is_array($categoriesId) ? $categoriesId : [];
        $this->rules['genres_id'][] = new GenresHasCategoriesRule($categoriesId);
    }

    public function store(Request $request)
    {
        $this->addRuleIfGenreHasCategory($request);
        $validateData = $this->validate($request, $this->rulesStore());
        $result = $this->model()::create($validateData);
        $result->refresh();
        $resource = $this->resource();
        return new $resource($result);
    }

    public function update(Request $request, $id)
    {
        $model = $this->findOrFail($id);
        $this->addRuleIfGenreHasCategory($request);
        $validateData = $this->validate($request, $this->rulesUpdate());
        $model->update($validateData);
        $resource = $this->resource();
        return new $resource($model);
    }

    protected function rulesStore()
    {
        return $this->rules;
    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }

    protected function resource()
    {
        return VideoResource::class;
    }

    protected function queryBuilder(): Builder
    {
        $action = \Route::getCurrentRoute()->getAction()['uses'];
        return parent::queryBuilder()->with([
            strpos($action, 'show') !== false
            || strpos($action, 'store') !== false
            || strpos($action, 'update') !== false
                ? 'genres.categories'
                : 'genres',
            'categories'
        ]);
    }

    protected function resourceCollection()
    {
        return $this->resource();
    }
}
