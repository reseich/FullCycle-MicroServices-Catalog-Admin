<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Rules\GenresHasCategoriesRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => ['required', 'array', 'exists:genres,id,deleted_at,NULL'],
            'video_file' => 'mimetypes:video/mp4|max:15',
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
        return $result;
    }

    public function update(Request $request, $id)
    {
        $model = $this->findOrFail($id);
        $this->addRuleIfGenreHasCategory($request);
        $validateData = $this->validate($request, $this->rulesUpdate());
        $model->update($validateData);
        return $model;
    }

    protected function rulesStore()
    {
        return $this->rules;
    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }
}
